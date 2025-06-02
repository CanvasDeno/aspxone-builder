
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  if (!selectedElement || !editedElement) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Edit Element</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">Select an element to edit its properties</p>
        </CardContent>
      </Card>
    );
  }

  const handleContentChange = (content: string) => {
    setEditedElement(prev => prev ? { ...prev, content } : null);
  };

  const handlePropertyChange = (key: string, value: string) => {
    setEditedElement(prev => prev ? {
      ...prev,
      properties: { ...prev.properties, [key]: value }
    } : null);
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
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Edit Element</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">
            {editedElement.type === 'image' ? 'Alt Text' : 'Text'}
          </Label>
          <Input
            id="content"
            value={editedElement.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Enter ${editedElement.type} content`}
          />
        </div>

        {editedElement.type !== 'image' && (
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

        <div className="pt-4 space-y-2">
          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
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
