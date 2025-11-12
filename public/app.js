const imageInput = document.getElementById('image-input');
const originalPreview = document.getElementById('original-preview');
const stickerPreview = document.getElementById('sticker-preview');
const generateButton = document.getElementById('generate-button');
const showProductButton = document.getElementById('show-product-button');
const productsCard = document.getElementById('products-card');
const statusEl = document.getElementById('status');
const styleOptions = document.querySelectorAll('.style-option');
const mockSticker = document.getElementById('mock-sticker');
const mockMug = document.getElementById('mock-mug');
const mockPoster = document.getElementById('mock-poster');

let selectedStyle = 'anime';
let originalImageData = null;
let generatedSticker = null;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

styleOptions.forEach((button) => {
  button.addEventListener('click', () => {
    styleOptions.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    selectedStyle = button.dataset.style;
  });
});

imageInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    statusEl.textContent = 'Please choose an image smaller than 5 MB.';
    imageInput.value = '';
    return;
  }

  originalImageData = await fileToDataUrl(file);
  renderPreview(originalPreview, originalImageData, 'Your upload will appear here.');
  generateButton.disabled = false;
  statusEl.textContent = '';
});

generateButton.addEventListener('click', async () => {
  if (!originalImageData) {
    statusEl.textContent = 'Upload an image first.';
    return;
  }

  try {
    toggleLoading(true);
    statusEl.textContent = 'Crafting your sticker with gpt-image-1...';

    const response = await fetch('/api/stickers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: originalImageData,
        style: selectedStyle
      })
    });

    if (!response.ok) {
      throw new Error('Sticker generation failed');
    }

    const result = await response.json();
    generatedSticker = result.image || originalImageData;

    renderPreview(stickerPreview, generatedSticker, 'Your sticker preview will show here.');
    [mockSticker, mockMug, mockPoster].forEach((img) => {
      img.src = generatedSticker;
      img.alt = 'Generated sticker design';
    });

    statusEl.textContent = result.placeholder
      ? 'Mock preview shown because OPENAI_API_KEY is not configured.'
      : 'Sticker ready! Try it on a product.';

    showProductButton.hidden = false;
    productsCard.hidden = true;
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Something went wrong. Please try again.';
  } finally {
    toggleLoading(false);
  }
});

showProductButton.addEventListener('click', () => {
  if (!generatedSticker) return;
  productsCard.hidden = false;
  productsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function renderPreview(container, dataUrl, fallbackText) {
  container.innerHTML = '';
  if (!dataUrl) {
    const span = document.createElement('span');
    span.textContent = fallbackText;
    container.appendChild(span);
    return;
  }

  const img = document.createElement('img');
  img.src = dataUrl;
  img.alt = 'Preview';
  container.appendChild(img);
}

function toggleLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.textContent = isLoading ? 'Generating…' : 'Generate sticker';
}

renderPreview(originalPreview, null, 'Your upload will appear here.');
renderPreview(stickerPreview, null, 'Your sticker preview will show here.');
