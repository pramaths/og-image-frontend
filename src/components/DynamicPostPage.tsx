import React, { useState, ChangeEvent, useEffect } from 'react';
import { Loader, Upload, XCircle, Copy, Check } from 'lucide-react';

interface Post {
  title: string;
  content: string;
  imageUrl: string;
  type: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const OG_IMAGE_TYPES = [
  { value: 'default', label: 'Default (Title and Content)' },
  { value: 'withBackground', label: 'With Background Image' },
  { value: 'topLeftImage', label: 'Image on Top Left' },
  { value: 'splitView', label: 'Split View (Image and Content)' },
];

const EXAMPLE_IMAGES = [
  { 
    url: 'https://via.placeholder.com/1200x630/3498db/ffffff?text=Default+OG+Image', 
    type: 'default', 
    title: 'Default (Title and Content)' 
  },
  { 
    url: 'https://via.placeholder.com/1200x630/e74c3c/ffffff?text=With+Background+Image', 
    type: 'withBackground', 
    title: 'With Background Image' 
  },
  { 
    url: 'https://via.placeholder.com/1200x630/2ecc71/ffffff?text=Image+on+Top+Left', 
    type: 'topLeftImage', 
    title: 'Image on Top Left' 
  },
  { 
    url: 'https://via.placeholder.com/1200x630/f39c12/ffffff?text=Split+View', 
    type: 'splitView', 
    title: 'Split View (Image and Content)' 
  },
];

const Toast: React.FC<{ toast: Toast | null }> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {toast.message}
    </div>
  );
};

const DynamicPostPage: React.FC = () => {
  const [post, setPost] = useState<Post>({ title: '', content: '', imageUrl: '', type: 'default' });
  const [ogImageUrl, setOgImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (ogImageUrl) {
      const newMetadata = `
<meta property="og:title" content="${post.title}" />
<meta property="og:description" content="${post.content}" />
<meta property="og:image" content="${ogImageUrl}" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
      `;
      setMetadata(newMetadata.trim());
    }
  }, [ogImageUrl, post.title, post.content]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateOgImage = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://og-image-backend.vercel.app/generate-og-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          imageUrl: uploadedImage || post.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate OG image');
      }

      const data = await response.json();
      setOgImageUrl(data.imageUrl);
      showToast('OG Image generated successfully!', 'success');

    } catch (error) {
      console.error('Error generating OG image:', error);
      showToast('Failed to generate OG image. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setPost(prev => ({ ...prev, imageUrl: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const url = e.target.value;
    setPost(prev => ({ ...prev, imageUrl: url }));
    setUploadedImage(null);
  };

  const clearImage = () => {
    setUploadedImage(null);
    setPost(prev => ({ ...prev, imageUrl: '' }));
  };

  const copyMetadata = () => {
    navigator.clipboard.writeText(metadata);
    setCopied(true);
    showToast('Metadata copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f1] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create OG Image</h1>

        <div className="space-y-6">
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            placeholder="Enter post title"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400 bg-white"
          />

          <textarea
            name="content"
            value={post.content}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter post content"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400 bg-white"
          />

          <select
            name="type"
            value={post.type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            {OG_IMAGE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="image-upload" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition duration-300 text-center">
                <Upload className="inline-block mr-2" size={20} />
                Upload Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                type="text"
                value={post.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Or enter image URL"
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400 bg-white"
              />
            </div>
            {(uploadedImage || post.imageUrl) && (
              <div className="relative">
                <img 
                  src={uploadedImage || post.imageUrl} 
                  alt="Selected" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                >
                  <XCircle size={20} />
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={generateOgImage}
            disabled={isLoading || (!post.title && !post.content && !uploadedImage && !post.imageUrl)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition duration-300 flex items-center justify-center disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Generating...
              </>
            ) : (
              'Generate OG Image'
            )}
          </button>

          {ogImageUrl && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Generated OG Image:</h2>
              <img src={ogImageUrl} alt="OG Image" className="rounded-lg w-full h-auto shadow-md" />
              
              <div className="bg-white border border-gray-200 p-4 rounded-md relative">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">{metadata}</pre>
                <button 
                  onClick={copyMetadata}
                  className="absolute top-2 right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              
              <p className="text-sm text-gray-600">
                Copy and paste this metadata into your HTML's <code>&lt;head&gt;</code> section to enable OG image functionality.
              </p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Example OG Images:</h2>
            <div className="grid grid-cols-2 gap-4">
              {EXAMPLE_IMAGES.map((image, index) => (
                <div key={index} className="space-y-2">
                  <img src={image.url} alt={image.title} className="w-full h-auto rounded-md shadow-md" />
                  <p className="text-sm text-center text-gray-600">{image.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
};

export default DynamicPostPage;