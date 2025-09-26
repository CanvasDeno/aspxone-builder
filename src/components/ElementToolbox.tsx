
import React from 'react';
import { useDrag } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type, FileText, Link, Square, Image, Code, FileCode, AudioLines, Video, Navigation, MapPin, FormInput, Play } from 'lucide-react';

interface ElementToolboxProps {
  onAddElement: (type: 'heading' | 'paragraph' | 'link' | 'button' | 'image' | 'csharp' | 'pagecode' | 'audio' | 'video' | 'navbar' | 'footer' | 'textbox') => void;
  onExport: () => void;
  onExportVbNet: () => void;
  onTriggerJs: () => void;
}

const ElementToolbox: React.FC<ElementToolboxProps> = ({ onAddElement, onExport, onExportVbNet, onTriggerJs }) => {
  const elementTypes = [
    { type: 'heading' as const, label: 'Add Heading', icon: Type },
    { type: 'paragraph' as const, label: 'Add Paragraph', icon: FileText },
    { type: 'link' as const, label: 'Add Link', icon: Link },
    { type: 'button' as const, label: 'Add Button', icon: Square },
    { type: 'textbox' as const, label: 'Add Textbox', icon: FormInput },
    { type: 'image' as const, label: 'Add Image', icon: Image },
    { type: 'navbar' as const, label: 'Add Navigation', icon: Navigation },
    { type: 'footer' as const, label: 'Add Footer', icon: MapPin },
    { type: 'audio' as const, label: 'Add Audio', icon: AudioLines },
    { type: 'video' as const, label: 'Add Video', icon: Video },
    { type: 'pagecode' as const, label: 'Add Page Code', icon: FileCode },
    { type: 'csharp' as const, label: 'Add Code Block', icon: Code },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Add Elements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {elementTypes.map(({ type, label, icon: Icon }) => (
          <DraggableButton
            key={type}
            type={type}
            label={label}
            icon={Icon}
            onClick={() => onAddElement(type)}
          />
        ))}
        
        <div className="pt-4 border-t border-border space-y-2">
          <Button 
            onClick={onTriggerJs}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Trigger JavaScript
          </Button>
        </div>
        
        <div className="pt-2 border-t border-border space-y-2">
          <Button 
            onClick={onExport}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Export as .cshtml (Beta)
          </Button>
          <Button 
            onClick={onExportVbNet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Export as .vbhtml (Beta)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface DraggableButtonProps {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
}

const DraggableButton: React.FC<DraggableButtonProps> = ({ type, label, icon: Icon, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Button
      ref={drag}
      variant="outline"
      className={`w-full justify-start gap-2 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default ElementToolbox;
