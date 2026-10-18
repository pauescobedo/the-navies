const videoDialog = document.querySelector('#video-dialog');
const videoDialogTitle = document.querySelector('#video-dialog-title');
document.querySelectorAll('[data-video]').forEach((button) => button.addEventListener('click', () => {
  videoDialogTitle.textContent = button.dataset.video;
  videoDialog.showModal();
}));
videoDialog.querySelector('.dialog-close').addEventListener('click', () => videoDialog.close());
videoDialog.addEventListener('click', (event) => { if (event.target === videoDialog) videoDialog.close(); });
