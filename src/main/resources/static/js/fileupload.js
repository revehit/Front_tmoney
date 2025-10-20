// 파일: file-uploader.js
(function (win, doc) {
  function formatBytes(bytes) {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i))}${sizes[i]}`;
  }

  function FileUploader(root) {
    this.root = typeof root === 'string' ? doc.querySelector(root) : root;
    if (!this.root) return;

    this.input   = this.root.querySelector('.file-input');
    this.drop    = this.root.querySelector('.file-drop');
    this.list    = this.root.querySelector('.file-list');
    this.tpl     = this.root.querySelector('#fileItemTpl');
    this.browse  = this.root.querySelector('[data-action="browse"]');

    // 정책
    this.accept   = (this.root.dataset.accept || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    this.maxFiles = parseInt(this.root.dataset.maxFiles || '3', 10);
    this.maxSize  = parseInt(this.root.dataset.maxSize  || '10485760', 10);

    this.files = []; // {file, name, size, ext, id}

    this.bind();
  }

  FileUploader.prototype.bind = function () {
    if (this.browse) {
      this.browse.addEventListener('click', () => this.input && this.input.click());
    }
    if (this.input) {
      this.input.addEventListener('change', (e) => {
        this.addFiles(Array.from(e.target.files || []));
        this.input.value = ''; // 같은 파일 재선택 허용
      });
    }

    // DnD
    ['dragenter','dragover'].forEach(evt =>
      this.drop.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        this.drop.classList.add('is-dragover');
      })
    );
    ['dragleave','drop'].forEach(evt =>
      this.drop.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        this.drop.classList.remove('is-dragover');
      })
    );
    this.drop.addEventListener('drop', (e) => {
      const dtFiles = Array.from(e.dataTransfer.files || []);
      this.addFiles(dtFiles);
    });

    // 삭제 위임
    this.list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="remove"]');
      if (!btn) return;
      const li = btn.closest('.file-item');
      if (!li) return;
      const id = li.getAttribute('data-id');
      this.removeById(id);
    });
  };

  FileUploader.prototype.extAllowed = function (name) {
    if (!this.accept.length) return true;
    const ext = '.' + (name.split('.').pop() || '').toLowerCase();
    return this.accept.includes(ext);
  };

  FileUploader.prototype.addFiles = function (newFiles) {
    if (!newFiles.length) return;

    const remain = this.maxFiles - this.files.length;
    const queue = newFiles.slice(0, remain);

    const valid = [];
    queue.forEach(f => {
      if (!this.extAllowed(f.name)) {
        this.emit('error', { type: 'ext', file: f });
        return;
      }
      if (f.size > this.maxSize) {
        this.emit('error', { type: 'size', file: f });
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      valid.push({ id, file: f, name: f.name, size: f.size });
    });

    this.files = this.files.concat(valid);
    this.render();

    // 콜백
    this.emit('change', this.getState());
  };

  FileUploader.prototype.removeById = function (id) {
    const idx = this.files.findIndex(f => f.id === id);
    if (idx < 0) return;
    const removed = this.files.splice(idx, 1)[0];
    this.render();
    this.emit('remove', removed);
    this.emit('change', this.getState());
  };

  FileUploader.prototype.render = function () {
    this.list.innerHTML = '';
    this.files.forEach(({ id, name, size }) => {
      const node = doc.importNode(this.tpl.content, true);
      const li   = node.querySelector('.file-item');
      const nameEl = node.querySelector('.file-name');
      li.setAttribute('data-id', id);
      nameEl.textContent = `${name} [${name.split('.').pop().toLowerCase()}, ${formatBytes(size)}]`;
      this.list.appendChild(node);
    });
  };

  FileUploader.prototype.getState = function () {
    // FormData 연동 시 사용
    const fd = new FormData();
    this.files.forEach((f, i) => fd.append('evidence[]', f.file, f.name));
    return { files: this.files.slice(), formData: fd };
  };

  FileUploader.prototype.on = function (event, handler) {
    this._handlers = this._handlers || {};
    (this._handlers[event] = this._handlers[event] || []).push(handler);
    return this;
  };
  FileUploader.prototype.emit = function (event, payload) {
    (this._handlers && this._handlers[event] || []).forEach(fn => fn(payload));
  };

  // 전역 노출
  win.FileUploader = FileUploader;

})(window, document);
