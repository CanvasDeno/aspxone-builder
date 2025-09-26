import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PageElement } from '@/pages/Index';

interface ElementEditorProps {
  selectedElement: PageElement | null;
  onUpdateElement: (element: PageElement) => void;
  onDeleteElement: (elementId: string) => void;
  onCancel: () => void;
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onCancel,
}) => {
  const [editedElement, setEditedElement] = useState<PageElement | null>(null);

  useEffect(() => {
    setEditedElement(selectedElement);
  }, [selectedElement]);

  // Auto-save whenever editedElement changes
  useEffect(() => {
    if (editedElement && selectedElement && editedElement.id === selectedElement.id) {
      onUpdateElement(editedElement);
    }
  }, [editedElement, onUpdateElement, selectedElement]);

  if (!selectedElement || !editedElement) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Edit Element</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Select an element to edit its properties</p>
        </CardContent>
      </Card>
    );
  }

  const handleContentChange = (content: string) => {
    setEditedElement(prev => prev ? { ...prev, content } : null);
  };

  const handlePropertyChange = (key: string, value: string | boolean) => {
    setEditedElement(prev => prev ? {
      ...prev,
      properties: { ...prev.properties, [key]: value }
    } : null);
  };

  const handleNavItemsChange = (navItems: Array<{ text: string; icon?: string; href: string }>) => {
    setEditedElement(prev => prev ? {
      ...prev,
      properties: { ...prev.properties, navItems }
    } : null);
  };

  const handleNavItemChange = (index: number, field: string, value: string) => {
    const navItems = [...(editedElement.properties.navItems || [])];
    navItems[index] = { ...navItems[index], [field]: value };
    handleNavItemsChange(navItems);
  };

  const addNavItem = () => {
    const navItems = [...(editedElement.properties.navItems || [])];
    navItems.push({ text: 'New Item', href: '#' });
    handleNavItemsChange(navItems);
  };

  const removeNavItem = (index: number) => {
    const navItems = [...(editedElement.properties.navItems || [])];
    navItems.splice(index, 1);
    handleNavItemsChange(navItems);
  };

  const handleSave = () => {
    if (editedElement) {
      onUpdateElement(editedElement);
    }
  };

  const handleDelete = () => {
    onDeleteElement(selectedElement.id);
  };

  const renderTypeSpecificFields = () => {
    switch (editedElement.type) {
      case 'heading':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={editedElement.properties.level} onValueChange={(value) => handlePropertyChange('level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="H1">H1</SelectItem>
                  <SelectItem value="H2">H2</SelectItem>
                  <SelectItem value="H3">H3</SelectItem>
                  <SelectItem value="H4">H4</SelectItem>
                  <SelectItem value="H5">H5</SelectItem>
                  <SelectItem value="H6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'link':
        return (
          <div className="space-y-2">
            <Label htmlFor="href">URL</Label>
            <Input
              id="href"
              value={editedElement.properties.href || ''}
              onChange={(e) => handlePropertyChange('href', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );
      case 'button':
        return (
          <div className="space-y-2">
            <Label htmlFor="href">Link URL</Label>
            <Input
              id="href"
              value={editedElement.properties.href || ''}
              onChange={(e) => handlePropertyChange('href', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );
      case 'textbox':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={editedElement.properties.placeholder || ''}
                onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                placeholder="Enter placeholder text..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inputType">Input Type</Label>
              <Select value={editedElement.properties.inputType || 'text'} onValueChange={(value) => handlePropertyChange('inputType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'navbar':
        return (
          <div className="space-y-4">
            <Label>Navigation Items</Label>
            {(editedElement.properties.navItems || []).map((item: any, index: number) => (
              <div key={index} className="border border-border rounded p-3 space-y-2">
                <Input
                  value={item.text || ''}
                  onChange={(e) => handleNavItemChange(index, 'text', e.target.value)}
                  placeholder="Menu text"
                />
                <Input
                  value={item.href || ''}
                  onChange={(e) => handleNavItemChange(index, 'href', e.target.value)}
                  placeholder="Link URL"
                />
                <Input
                  value={item.icon || ''}
                  onChange={(e) => handleNavItemChange(index, 'icon', e.target.value)}
                  placeholder="Icon class (optional)"
                />
                <Button onClick={() => removeNavItem(index)} variant="destructive" size="sm">
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addNavItem} variant="outline" className="w-full">
              Add Navigation Item
            </Button>
          </div>
        );
      case 'footer':
        return (
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={editedElement.properties.footerText || ''}
              onChange={(e) => handlePropertyChange('footerText', e.target.value)}
              placeholder="Footer content..."
              className="min-h-[80px]"
            />
          </div>
        );
      case 'image':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={editedElement.properties.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={editedElement.properties.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                placeholder="Description of image"
              />
            </div>
          </>
        );
      case 'audio':
      case 'video':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="src">{editedElement.type === 'audio' ? 'Audio' : 'Video'} URL</Label>
              <Input
                id="src"
                value={editedElement.properties.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                placeholder={`https://example.com/${editedElement.type}.${editedElement.type === 'audio' ? 'mp3' : 'mp4'}`}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="controls"
                  checked={editedElement.properties.controls || false}
                  onCheckedChange={(checked) => handlePropertyChange('controls', checked)}
                />
                <Label htmlFor="controls">Show Controls</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoplay"
                  checked={editedElement.properties.autoplay || false}
                  onCheckedChange={(checked) => handlePropertyChange('autoplay', checked)}
                />
                <Label htmlFor="autoplay">Autoplay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="loop"
                  checked={editedElement.properties.loop || false}
                  onCheckedChange={(checked) => handlePropertyChange('loop', checked)}
                />
                <Label htmlFor="loop">Loop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="muted"
                  checked={editedElement.properties.muted || false}
                  onCheckedChange={(checked) => handlePropertyChange('muted', checked)}
                />
                <Label htmlFor="muted">Muted</Label>
              </div>
            </div>
          </>
        );
      case 'csharp':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="scriptingMode">Scripting Mode</Label>
              <Select 
                value={editedElement.properties.scriptingMode || 'razor'} 
                onValueChange={(value) => handlePropertyChange('scriptingMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="razor">ASP.NET Razor (C#)</SelectItem>
                  <SelectItem value="mvc">ASP.NET MVC (C#)</SelectItem>
                  <SelectItem value="vbnet">VB.NET</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">
                {editedElement.properties.scriptingMode === 'vbnet' ? 'VB.NET Code' : 'C# Code Block'}
              </Label>
              <Textarea
                id="code"
                value={editedElement.properties.code || ''}
                onChange={(e) => handlePropertyChange('code', e.target.value)}
                placeholder={
                  editedElement.properties.scriptingMode === 'vbnet'
                    ? 'Dim message As String = "Hello World"'
                    : 'Enter your C# code here...'
                }
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </>
        );
      case 'pagecode':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="scriptingMode">Scripting Mode</Label>
              <Select 
                value={editedElement.properties.scriptingMode || 'javascript'} 
                onValueChange={(value) => handlePropertyChange('scriptingMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="razor">ASP.NET Razor (C#)</SelectItem>
                  <SelectItem value="mvc">ASP.NET MVC (C#)</SelectItem>
                  <SelectItem value="vbnet">VB.NET</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">
                {editedElement.properties.scriptingMode === 'javascript' ? 'JavaScript Code' :
                 editedElement.properties.scriptingMode === 'vbnet' ? 'VB.NET Code' :
                 'C# Page Code'}
              </Label>
              <Textarea
                id="code"
                value={editedElement.properties.code || ''}
                onChange={(e) => handlePropertyChange('code', e.target.value)}
                placeholder={
                  editedElement.properties.scriptingMode === 'javascript' 
                    ? 'Enter your JavaScript code here...'
                    : editedElement.properties.scriptingMode === 'vbnet'
                    ? 'Dim message As String = "Hello World"'
                    : 'Enter your C# code here...'
                }
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderColorFields = () => {
    if (editedElement.type === 'image' || editedElement.type === 'audio' || editedElement.type === 'video') {
      return (
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={editedElement.properties.backgroundColor || 'transparent'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={editedElement.properties.backgroundColor === 'transparent' ? '#ffffff' : editedElement.properties.backgroundColor || '#ffffff'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="textColor">Text Color</Label>
          <Input
            id="textColor"
            type="color"
            value={editedElement.properties.textColor || '#000000'}
            onChange={(e) => handlePropertyChange('textColor', e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Edit Element</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">
            {editedElement.type === 'image' ? 'Alt Text' : 
             editedElement.type === 'csharp' ? 'Code Block Description' : 
             editedElement.type === 'pagecode' ? 'Page Code Description' :
             editedElement.type === 'audio' ? 'Audio Description' :
             editedElement.type === 'video' ? 'Video Description' :
             editedElement.type === 'navbar' ? 'Site/Brand Name' :
             editedElement.type === 'footer' ? 'Footer Title' :
             editedElement.type === 'textbox' ? 'Input Label' : 'Text'}
          </Label>
          <Input
            id="content"
            value={editedElement.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Enter ${editedElement.type} content`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="elementId">Element ID</Label>
          <Input
            id="elementId"
            value={editedElement.properties.elementId || ''}
            onChange={(e) => handlePropertyChange('elementId', e.target.value)}
            placeholder="my-element-id"
          />
        </div>

        {editedElement.type !== 'image' && editedElement.type !== 'csharp' && editedElement.type !== 'pagecode' && editedElement.type !== 'audio' && editedElement.type !== 'video' && editedElement.type !== 'navbar' && editedElement.type !== 'footer' && editedElement.type !== 'textbox' && (
          <div className="space-y-2">
            <Label htmlFor="size">Size (approx)</Label>
            <Select value={editedElement.properties.size} onValueChange={(value) => handlePropertyChange('size', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">XS</SelectItem>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
                <SelectItem value="2XL">2XL</SelectItem>
                <SelectItem value="3XL">3XL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {renderTypeSpecificFields()}

        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-2 block">Colors</Label>
          {renderColorFields()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customCss">Custom CSS</Label>
          <Textarea
            id="customCss"
            value={editedElement.properties.customCss || ''}
            onChange={(e) => handlePropertyChange('customCss', e.target.value)}
            placeholder="margin: 10px; padding: 5px; border: 1px solid #ccc;"
            className="min-h-[80px] font-mono text-sm"
          />
        </div>

        <div className="pt-4 space-y-2">
          <Button onClick={handleDelete} variant="destructive" className="w-full">
            Delete Element
          </Button>
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementEditor;
