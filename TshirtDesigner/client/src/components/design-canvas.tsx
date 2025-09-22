import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, Square, Circle, Upload, Save, Share } from "lucide-react";

// Note: In a real implementation, this would use Fabric.js
// For now, we'll create a simplified canvas interface

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'shapes' | 'images' | 'colors'>('text');
  const [tshirtColor, setTshirtColor] = useState('#ffffff');
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    drawCanvas();
  }, [elements, tshirtColor]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw T-shirt background
    ctx.fillStyle = tshirtColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw elements
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

  const saveDesign = () => {
    // TODO: Implement save functionality
    console.log('Saving design:', elements);
  };

  const shareDesign = () => {
    // TODO: Implement share functionality
    console.log('Sharing design:', elements);
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
                  <Label>T-Shirt Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#6b7280'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setTshirtColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${tshirtColor === color ? 'border-primary' : 'border-border'}`}
                        style={{ backgroundColor: color }}
                        data-testid={`button-tshirt-color-${color.replace('#', '')}`}
                      />
                    ))}
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
            {/* T-Shirt Options */}
            <div>
              <Label>Size</Label>
              <Select defaultValue="M">
                <SelectTrigger data-testid="select-tshirt-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
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
              <Button variant="secondary" className="w-full" onClick={saveDesign} data-testid="button-save-design">
                <Save className="h-4 w-4 mr-2" />
                Save Design
              </Button>
              <Button variant="outline" className="w-full" onClick={shareDesign} data-testid="button-share-design">
                <Share className="h-4 w-4 mr-2" />
                Share Design
              </Button>
              <Button className="w-full" data-testid="button-add-to-cart-design">
                Add to Cart - $32.99
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
