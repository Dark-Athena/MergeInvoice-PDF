// PDF合并器应用
const { PDFDocument } = PDFLib;

class PDFMerger {
    constructor() {
        this.files = [];
        this.mergedPdfBytes = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        this.optionsSection = document.getElementById('optionsSection');
        this.mergeBtn = document.getElementById('mergeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.previewSection = document.getElementById('previewSection');
        this.previewContainer = document.getElementById('previewContainer');
        this.progressSection = document.getElementById('progressSection');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.paperSizeSelect = document.getElementById('paperSizeSelect');
        this.rowsInput = document.getElementById('rowsInput');
        this.colsInput = document.getElementById('colsInput');
        this.paddingInput = document.getElementById('paddingInput');
    }

    attachEventListeners() {
        // 文件上传
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // 拖拽上传
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
            this.addFiles(files);
        });

        // 按钮事件
        this.mergeBtn.addEventListener('click', () => this.mergePDFs());
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        this.clearBtn.addEventListener('click', () => this.clearFiles());
    }

    async handleFileSelect(e) {
        console.log('文件选择事件触发');
        const files = Array.from(e.target.files);
        console.log('选择的文件数量:', files.length);

        const pdfFiles = files.filter(f => {
            console.log('文件类型:', f.name, f.type);
            return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        });

        console.log('PDF文件数量:', pdfFiles.length);

        if (pdfFiles.length === 0) {
            alert('请选择PDF文件');
            return;
        }

        await this.addFiles(pdfFiles);
        e.target.value = ''; // 清空input以便重复选择
    }

    async addFiles(newFiles) {
        if (!newFiles || newFiles.length === 0) {
            console.log('没有文件需要添加');
            return;
        }

        console.log('开始添加文件，数量:', newFiles.length);

        try {
            for (const file of newFiles) {
                console.log('读取文件:', file.name);
                const arrayBuffer = await file.arrayBuffer();
                console.log('文件读取成功，大小:', arrayBuffer.byteLength);

                this.files.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    data: arrayBuffer
                });
            }

            console.log('所有文件添加完成，总数:', this.files.length);
            this.renderFileList();
            this.optionsSection.style.display = this.files.length > 0 ? 'block' : 'none';

        } catch (error) {
            console.error('添加文件时出错:', error);
            alert('读取文件时出错: ' + error.message);
        }
    }

    renderFileList() {
        console.log('渲染文件列表，文件数:', this.files.length);

        if (this.files.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }

        this.fileList.innerHTML = this.files.map((file, index) => `
            <div class="file-item" draggable="true" data-index="${index}">
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div class="file-details">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-icon" onclick="app.moveFileUp(${index})" title="上移" ${index === 0 ? 'disabled' : ''}>
                        ⬆️
                    </button>
                    <button class="btn-icon" onclick="app.moveFileDown(${index})" title="下移" ${index === this.files.length - 1 ? 'disabled' : ''}>
                        ⬇️
                    </button>
                    <button class="btn-icon" onclick="app.removeFile(${index})" title="删除">
                        ❌
                    </button>
                </div>
            </div>
        `).join('');

        console.log('文件列表HTML已生成');

        // 添加拖拽排序功能
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const items = this.fileList.querySelectorAll('.file-item');
        let draggedItem = null;

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(e.clientY);
                if (afterElement == null) {
                    this.fileList.appendChild(draggedItem);
                } else {
                    this.fileList.insertBefore(draggedItem, afterElement);
                }
            });

            item.addEventListener('drop', () => {
                const newOrder = Array.from(this.fileList.querySelectorAll('.file-item'))
                    .map(el => parseInt(el.dataset.index));
                this.files = newOrder.map(i => this.files[i]);
                this.renderFileList();
            });
        });
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.fileList.querySelectorAll('.file-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    moveFileUp(index) {
        if (index > 0) {
            [this.files[index - 1], this.files[index]] = [this.files[index], this.files[index - 1]];
            this.renderFileList();
        }
    }

    moveFileDown(index) {
        if (index < this.files.length - 1) {
            [this.files[index], this.files[index + 1]] = [this.files[index + 1], this.files[index]];
            this.renderFileList();
        }
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.renderFileList();
        if (this.files.length === 0) {
            this.optionsSection.style.display = 'none';
            this.previewSection.style.display = 'none';
            this.downloadBtn.style.display = 'none';
        }
    }

    clearFiles() {
        this.files = [];
        this.mergedPdfBytes = null;
        this.renderFileList();
        this.optionsSection.style.display = 'none';
        this.previewSection.style.display = 'none';
        this.downloadBtn.style.display = 'none';
    }

    setPreset(rows, cols, orientation) {
        this.rowsInput.value = rows;
        this.colsInput.value = cols;
        document.querySelector('input[name="orientation"][value="' + orientation + '"]').checked = true;
    }

    async mergePDFs() {
        if (this.files.length === 0) {
            alert('请先上传PDF文件');
            return;
        }

        const paperSize = this.paperSizeSelect.value;
        const orientation = document.querySelector('input[name="orientation"]:checked').value;
        const rows = parseInt(this.rowsInput.value) || 2;
        const cols = parseInt(this.colsInput.value) || 1;
        const padding = parseInt(this.paddingInput.value) || 10;

        this.showProgress('正在合并PDF...', 0);
        this.mergeBtn.disabled = true;

        try {
            const mergedPdf = await PDFDocument.create();

            // 纸张尺寸定义（单位：点，1英寸=72点）
            const paperSizes = {
                'a4': { width: 595.28, height: 841.89 }, // 210mm × 297mm
                'a3': { width: 841.89, height: 1190.55 }, // 297mm × 420mm
                'a5': { width: 419.53, height: 595.28 }, // 148mm × 210mm
                'letter': { width: 612, height: 792 }, // 8.5" × 11"
                'legal': { width: 612, height: 1008 } // 8.5" × 14"
            };

            const selectedSize = paperSizes[paperSize] || paperSizes.a4;

            // 根据方向确定页面尺寸
            const pageWidth = orientation === 'landscape' ? selectedSize.height : selectedSize.width;
            const pageHeight = orientation === 'landscape' ? selectedSize.width : selectedSize.height;

            console.log(`选择的纸张: ${paperSize}, 方向: ${orientation}, 尺寸: ${pageWidth} x ${pageHeight}`);

            // 计算每个单元格的尺寸
            const cellWidth = pageWidth / cols;
            const cellHeight = pageHeight / rows;

            let currentPage = null;
            let currentIndex = 0;
            const itemsPerPage = rows * cols;

            // 收集所有需要合并的页面
            const allPages = [];

            for (let i = 0; i < this.files.length; i++) {
                this.updateProgress(`加载文件 ${i + 1}/${this.files.length}...`, (i / this.files.length) * 40);

                const pdfDoc = await PDFDocument.load(this.files[i].data);
                const pageCount = pdfDoc.getPageCount();
                console.log(`文件 ${i + 1} 包含 ${pageCount} 页`);

                for (let j = 0; j < pageCount; j++) {
                    allPages.push({ doc: pdfDoc, pageIndex: j });
                }
            }

            console.log(`总共收集到 ${allPages.length} 页PDF内容`);

            this.updateProgress('合并页面...', 50);

            // 处理每个页面
            for (let i = 0; i < allPages.length; i++) {
                if (i % 10 === 0) {
                    this.updateProgress(`合并页面 ${i + 1}/${allPages.length}...`, 50 + (i / allPages.length) * 40);
                }

                const { doc, pageIndex } = allPages[i];
                const [copiedPage] = await mergedPdf.copyPages(doc, [pageIndex]);
                const { width, height } = copiedPage.getSize();

                // 如果当前位置是布局的开始，创建新页面
                if (currentIndex % itemsPerPage === 0) {
                    console.log(`创建新的合并页面，当前索引: ${currentIndex}`);
                    currentPage = mergedPdf.addPage([pageWidth, pageHeight]);
                }

                const position = currentIndex % itemsPerPage;
                const col = position % cols;
                const row = Math.floor(position / cols);

                console.log(`放置页面 ${i + 1} 到位置: 行=${row}, 列=${col}, 位置=${position}`);

                // 计算缩放比例（保持宽高比）
                const availableWidth = cellWidth - padding * 2;
                const availableHeight = cellHeight - padding * 2;
                const scaleX = availableWidth / width;
                const scaleY = availableHeight / height;
                const scale = Math.min(scaleX, scaleY);

                // 计算缩放后的尺寸
                const scaledWidth = width * scale;
                const scaledHeight = height * scale;

                // 计算位置（居中对齐）
                const x = col * cellWidth + (cellWidth - scaledWidth) / 2;
                const y = pageHeight - (row + 1) * cellHeight + (cellHeight - scaledHeight) / 2;

                // 嵌入页面并绘制
                const embeddedPage = await mergedPdf.embedPage(copiedPage);
                currentPage.drawPage(embeddedPage, {
                    x: x,
                    y: y,
                    width: scaledWidth,
                    height: scaledHeight,
                });

                currentIndex++;
            }

            this.updateProgress('生成PDF文件...', 90);
            const pdfBytes = await mergedPdf.save();
            this.mergedPdfBytes = pdfBytes;

            console.log('PDF生成成功，大小:', this.mergedPdfBytes.length, 'bytes');
            console.log('保存前检查 mergedPdfBytes 类型:', typeof this.mergedPdfBytes);
            console.log('mergedPdfBytes 是否为 Uint8Array:', this.mergedPdfBytes instanceof Uint8Array);

            this.updateProgress('完成！', 100);

            setTimeout(() => {
                console.log('准备调用预览，检查 mergedPdfBytes 长度:', this.mergedPdfBytes.length);
                console.log('mergedPdfBytes 类型:', typeof this.mergedPdfBytes);
                this.hideProgress();
                this.downloadBtn.style.display = 'inline-block';
                this.mergeBtn.disabled = false;
                this.generatePreview();
            }, 500);

        } catch (error) {
            console.error('合并PDF时出错:', error);
            alert('合并PDF时出错: ' + error.message);
            this.hideProgress();
            this.mergeBtn.disabled = false;
        }
    }

    async generatePreview() {
        console.log('=== generatePreview 被调用 ===');
        console.log('预览前检查 mergedPdfBytes 长度:', this.mergedPdfBytes ? this.mergedPdfBytes.length : 'null');

        if (!this.mergedPdfBytes || this.mergedPdfBytes.length === 0) {
            console.error('预览时 mergedPdfBytes 为空');
            return;
        }

        this.previewSection.style.display = 'block';
        this.previewContainer.innerHTML = '<p style="text-align: center; color: #6B7280;">正在生成预览...</p>';

        try {
            // 使用 PDF.js 渲染预览
            if (typeof pdfjsLib === 'undefined') {
                this.previewContainer.innerHTML = '<p style="text-align: center; color: #EF4444;">PDF.js 库未加载，无法生成预览。但PDF已合并成功，可以下载。</p>';
                return;
            }

            // 保存一份副本，防止被清空
            const pdfDataCopy = new Uint8Array(this.mergedPdfBytes);
            console.log('创建 PDF 数据副本，大小:', pdfDataCopy.length);

            const loadingTask = pdfjsLib.getDocument({
                data: pdfDataCopy,
                cMapUrl: (window.pdfjsConfig && window.pdfjsConfig.cMapUrl) || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: (window.pdfjsConfig && window.pdfjsConfig.cMapPacked) || true
            });
            const pdf = await loadingTask.promise;

            console.log(`PDF文档包含 ${pdf.numPages} 页`);

            this.previewContainer.innerHTML = '';

            // 渲染所有页面作为预览，确保显示完整的合并结果
            const pagesToRender = pdf.numPages;

            for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
                console.log(`渲染第 ${pageNum} 页`);
                const page = await pdf.getPage(pageNum);
                // 获取页面实际尺寸
                const pageInfo = page.getViewport({ scale: 1 });
                const actualWidth = pageInfo.width;
                const actualHeight = pageInfo.height;

                // 计算适合容器的缩放比例
                const maxWidth = 800; // 最大宽度
                const scale = Math.min(maxWidth / actualWidth, 1.2); // 限制最大缩放

                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                // 设置canvas样式以保持比例
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;

                const pageDiv = document.createElement('div');
                pageDiv.className = 'preview-page';
                // 设置页面容器样式以匹配实际比例
                pageDiv.style.width = 'fit-content';
                pageDiv.style.margin = '0 auto 20px auto';

                const title = document.createElement('div');
                title.className = 'preview-page-title';
                title.textContent = `第 ${pageNum} 页 (${Math.round(actualWidth)}×${Math.round(actualHeight)}pt)`;

                pageDiv.appendChild(title);
                pageDiv.appendChild(canvas);
                this.previewContainer.appendChild(pageDiv);
            }

            // 添加说明文字
            const infoText = document.createElement('p');
            infoText.style.cssText = 'text-align: center; color: #4F46E5; padding: 15px; font-size: 0.9rem;';
            infoText.textContent = `✅ PDF合并已完成！共 ${pdf.numPages} 页，以上为预览效果，点击上方下载按钮下载完整文件`;
            this.previewContainer.appendChild(infoText);

            // 确认 mergedPdfBytes 没有被清空
            console.log('预览完成，检查 mergedPdfBytes 长度:', this.mergedPdfBytes.length);

        } catch (error) {
            console.error('生成预览时出错:', error);
            this.previewContainer.innerHTML = '<p style="text-align: center; color: #EF4444;">预览生成失败，但PDF已合并成功，可以下载查看。</p>';
        }
    }

    downloadPDF() {
        console.log('=== downloadPDF 被调用 ===');
        console.log('mergedPdfBytes 类型:', typeof this.mergedPdfBytes);
        console.log('mergedPdfBytes 值:', this.mergedPdfBytes);
        console.log('mergedPdfBytes 长度:', this.mergedPdfBytes ? this.mergedPdfBytes.length : 'null');

        // 检查是否是 Uint8Array
        if (this.mergedPdfBytes && !(this.mergedPdfBytes instanceof Uint8Array)) {
            console.error('mergedPdfBytes 不是 Uint8Array 类型:', typeof this.mergedPdfBytes);
            console.error('mergedPdfBytes 构造函数:', this.mergedPdfBytes.constructor.name);
        }

        if (!this.mergedPdfBytes) {
            console.error('mergedPdfBytes 为 null 或 undefined');
            alert('请先合并PDF');
            return;
        }

        if (this.mergedPdfBytes.length === 0) {
            console.error('mergedPdfBytes 长度为 0');
            alert('PDF文件为空，请重新合并');
            return;
        }

        try {
            console.log('开始下载PDF，大小:', this.mergedPdfBytes.length, 'bytes');

            // 创建副本以防止修改原始数据
            const pdfDataCopy = new Uint8Array(this.mergedPdfBytes);
            console.log('创建副本，大小:', pdfDataCopy.length, 'bytes');

            const blob = new Blob([pdfDataCopy], { type: 'application/pdf' });
            console.log('Blob创建成功，大小:', blob.size, 'bytes');

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const now = new Date();
            const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            a.download = `合并的PDF_${timestamp}.pdf`;

            document.body.appendChild(a);
            a.click();

            // 延迟清理，确保下载完成
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('下载完成');
            }, 100);

        } catch (error) {
            console.error('下载PDF时出错:', error);
            alert('下载PDF时出错: ' + error.message);
        }
    }

    showProgress(text, percent) {
        this.progressSection.style.display = 'block';
        this.progressText.textContent = text;
        this.progressBar.style.width = percent + '%';
    }

    updateProgress(text, percent) {
        this.progressText.textContent = text;
        this.progressBar.style.width = percent + '%';
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PDFMerger();
});