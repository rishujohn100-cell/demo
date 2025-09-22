import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, Square, Circle, Upload, Save, Share, ShirtIcon } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Note: In a real implementation, this would use Fabric.js
// For now, we'll create a simplified canvas interface

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  category: string;
  colors: string[];
  sizes: string[];
  imageUrl?: string;
}

interface DesignElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize?: number;
  fontFamily?: string;
}

export function DesignCanvas() {
  const { user } = useAuth();
  const { addToCartMutation } = useCart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'shapes' | 'images' | 'colors'>('text');
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedSize, setSelectedSize] = useState('M');
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [tshirtImages, setTshirtImages] = useState<{[key: string]: HTMLImageElement}>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    fetchProducts();
    loadTshirtImages();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedColor, selectedProduct, imagesLoaded]);

  const loadTshirtImages = async () => {
    const imageMap: {[key: string]: HTMLImageElement} = {};
    const colors = ['white', 'black', 'navy', 'red', 'natural'];
    
    const imagePromises = colors.map((color) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageMap[color] = img;
          resolve();
        };
        img.onerror = () => {
          // Fallback to white image if specific color not found
          if (color !== 'white' && imageMap['white']) {
            imageMap[color] = imageMap['white'];
          }
          resolve();
        };
        // Map color names to image files
        const imageFileName = color === 'white' ? 'White_t-shirt_mockup_a7316e72.png' :
                              color === 'black' ? 'Black_t-shirt_mockup_7b5db8b3.png' :
                              color === 'navy' ? 'Navy_t-shirt_mockup_dd640fd4.png' :
                              'White_t-shirt_mockup_a7316e72.png'; // fallback to white
        img.src = `/images/products/${imageFileName}`;
      });
    });
    
    await Promise.all(imagePromises);
    setTshirtImages(imageMap);
    setImagesLoaded(true);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      // Set the first product as default if available
      if (data.length > 0) {
        setSelectedProduct(data[0]);
        setSelectedColor(data[0].colors[0]);
        setSelectedSize(data[0].sizes[0]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw t-shirt image background if available
    const tshirtImage = tshirtImages[selectedColor];
    if (selectedProduct && tshirtImage && imagesLoaded) {
      if (tshirtImage) {
        // Calculate image dimensions to fit canvas while maintaining aspect ratio
        const canvasRatio = canvas.width / canvas.height;
        const imageRatio = tshirtImage.width / tshirtImage.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imageRatio > canvasRatio) {
          // Image is wider than canvas ratio
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas ratio
          drawHeight = canvas.height;
          drawWidth = canvas.height * imageRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }
        
        ctx.drawImage(tshirtImage, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // Fallback to solid color background if image not loaded
        ctx.fillStyle = selectedColor === 'white' ? '#ffffff' : 
                       selectedColor === 'black' ? '#000000' : 
                       selectedColor === 'navy' ? '#1e3a8a' : 
                       selectedColor === 'red' ? '#ef4444' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      // For non-apparel products, use solid background
      ctx.fillStyle = selectedColor === 'white' ? '#ffffff' : 
                     selectedColor === 'black' ? '#000000' : 
                     selectedColor === 'navy' ? '#1e3a8a' : 
                     selectedColor === 'red' ? '#ef4444' : 
                     selectedColor === 'natural' ? '#f5f5dc' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw design elements on top of the t-shirt
    elements.forEach(element => {
      if (element.type === 'text') {
        ctx.fillStyle = element.color;
        ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.fillText(element.content, element.x, element.y);
      } else if (element.type === 'shape') {
        ctx.fillStyle = element.color;
        if (element.content === 'rectangle') {
          ctx.fillRect(element.x - element.width/2, element.y - element.height/2, element.width, element.height);
        } else if (element.content === 'circle') {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.width/2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
    
    // Draw product info overlay
    if (selectedProduct) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(5, 5, 200, 25);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedProduct.name} - ${selectedColor.toUpperCase()}`, 10, 22);
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;

    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: 'text',
      content: textInput,
      x: 160,
      y: 200,
      width: 100,
      height: 30,
      color: textColor,
      fontSize,
      fontFamily
    };

    setElements([...elements, newElement]);
    setTextInput('');
  };

  const addShape = (shapeType: 'rectangle' | 'circle') => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: 'shape',
      content: shapeType,
      x: 160,
      y: 200,
      width: 60,
      height: 60,
      color: textColor
    };

    setElements([...elements, newElement]);
  };

  const saveDesign = async (): Promise<string | null> => {
    if (!user) {
      toast.error('Please login to save designs');
      return null;
    }

    if (!selectedProduct || elements.length === 0) {
      toast.error('Please select a product and add some design elements');
      return null;
    }

    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      const thumbnail = canvas?.toDataURL('image/png');
      
      const designData = {
        product: selectedProduct,
        elements,
        color: selectedColor,
        size: selectedSize
      };
      
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${selectedProduct.name} Design`,
          designData,
          thumbnail
        })
      });
      
      if (response.ok) {
        const savedDesign = await response.json();
        setSavedDesignId(savedDesign.id);
        toast.success('Design saved successfully!');
        return savedDesign.id;
      } else {
        throw new Error('Failed to save design');
      }
    } catch (error) {
      console.error('Save design error:', error);
      toast.error('Failed to save design');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCartWithDesign = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    setIsLoading(true);
    try {
      // Save design first if not already saved and has elements
      let designId = savedDesignId;
      if (elements.length > 0 && !savedDesignId) {
        designId = await saveDesign();
      }
      
      // Fix customPrice to be a string as expected by the backend
      const customPrice = (parseFloat(selectedProduct.basePrice) + (elements.length > 0 ? 5 : 0)).toFixed(2);
      
      const cartItemData = {
        productId: selectedProduct.id,
        designId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        customPrice
      };
      
      await addToCartMutation.mutateAsync(cartItemData);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const shareDesign = () => {
    // TODO: Implement share functionality
    console.log('Sharing design:', elements);
    toast.info('Share functionality coming soon!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Design Tools Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Design Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Product Selection */}
            <div className="mb-6 space-y-4">
              <div>
                <Label className="flex items-center space-x-2 mb-2">
                  <ShirtIcon className="h-4 w-4" />
                  <span>Select Product</span>
                </Label>
                <Select 
                  value={selectedProduct?.id || ''} 
                  onValueChange={(value) => {
                    const product = products.find(p => p.id === value);
                    if (product) {
                      setSelectedProduct(product);
                      setSelectedColor(product.colors[0]);
                      setSelectedSize(product.sizes[0]);
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProduct && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Color</Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct.colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct.sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <Tabs value={selectedTool} onValueChange={(value) => setSelectedTool(value as any)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="text" data-testid="tab-text">
                  <Type className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="shapes" data-testid="tab-shapes">
                  <Square className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="images" data-testid="tab-images">
                  <Upload className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="colors" data-testid="tab-colors">
                  <Palette className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="text-input">Add Text</Label>
                  <Input
                    id="text-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your text"
                    data-testid="input-text-content"
                  />
                </div>
                
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger data-testid="select-font-family">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier">Courier</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="font-size">Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      data-testid="input-font-size"
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-color">Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      data-testid="input-text-color"
                    />
                  </div>
                </div>

                <Button onClick={addText} className="w-full" data-testid="button-add-text">
                  Add Text to Design
                </Button>
              </TabsContent>

              <TabsContent value="shapes" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => addShape('rectangle')}
                    className="aspect-square"
                    data-testid="button-add-rectangle"
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addShape('circle')}
                    className="aspect-square"
                    data-testid="button-add-circle"
                  >
                    <Circle className="h-6 w-6" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-6">
                <Button className="w-full" data-testid="button-upload-image">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <p className="text-sm text-muted-foreground">
                  Upload your own images or logos to add to your design.
                </p>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4 mt-6">
                <div>
                  <Label>Product Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {selectedProduct?.colors.map((color) => {
                      const colorValue = color === 'white' ? '#ffffff' : 
                                       color === 'black' ? '#000000' : 
                                       color === 'navy' ? '#1e3a8a' : 
                                       color === 'red' ? '#ef4444' : 
                                       color === 'natural' ? '#f5f5dc' : '#6b7280';
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-primary' : 'border-border'}`}
                          style={{ backgroundColor: colorValue }}
                          data-testid={`button-product-color-${color}`}
                          title={color.charAt(0).toUpperCase() + color.slice(1)}
                        />
                      );
                    }) || []}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Canvas Area */}
      <div className="lg:col-span-2 flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={320}
            height={384}
            className="border-2 border-border rounded-lg shadow-lg bg-white"
            data-testid="canvas-design"
          />
          
          {/* T-Shirt View Toggle */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <Button size="sm" data-testid="button-view-front">
              Front
            </Button>
            <Button size="sm" variant="outline" data-testid="button-view-back">
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm">{selectedProduct.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedProduct.description}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Base Price:</span>
                    <span>${selectedProduct.basePrice}</span>
                  </div>
                  {elements.length > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Design Fee:</span>
                      <span>+ $5.00</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-sm border-t pt-1">
                    <span>Unit Price:</span>
                    <span>${(parseFloat(selectedProduct.basePrice) + (elements.length > 0 ? 5 : 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Total ({quantity}x):</span>
                    <span>${((parseFloat(selectedProduct.basePrice) + (elements.length > 0 ? 5 : 0)) * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Options */}
            <div>
              <Label>Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger data-testid="select-product-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct?.sizes.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="w-8 h-8" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                >
                  -
                </Button>
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center" 
                  data-testid="input-quantity" 
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="w-8 h-8" 
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Design Actions */}
            <div className="space-y-3 pt-4">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={saveDesign} 
                disabled={isLoading || !selectedProduct}
                data-testid="button-save-design"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : savedDesignId ? 'Design Saved' : 'Save Design'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={shareDesign} 
                disabled={isLoading || !selectedProduct}
                data-testid="button-share-design"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Design
              </Button>
              <Button 
                className="w-full" 
                onClick={addToCartWithDesign}
                disabled={isLoading || !selectedProduct}
                data-testid="button-add-to-cart-design"
              >
                {isLoading ? 'Adding...' : `Add to Cart - $${selectedProduct ? (parseFloat(selectedProduct.basePrice) + (elements.length > 0 ? 5 : 0)).toFixed(2) : '0.00'}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
