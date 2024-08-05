import React, { useState, ChangeEvent } from 'react';
import { Loader, Upload, XCircle } from 'lucide-react';

interface Post {
  title: string;
  content: string;
  imageUrl: string;
}

const DynamicPostPage: React.FC = () => {
  const [post, setPost] = useState<Post>({ title: '', content: '', imageUrl: '' });
  const [ogImageUrl, setOgImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

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

        // Directly set the ogImageUrl to the response URL
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setOgImageUrl(imageUrl); // Set the generated image URL

    } catch (error) {
        console.error('Error generating OG image:', error);
        // Handle error (e.g., show an error message to the user)
    } finally {
        setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Generated OG Image:</h2>
              <img src={ogImageUrl} alt="OG Image" className="rounded-lg w-full h-auto shadow-md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPostPage;