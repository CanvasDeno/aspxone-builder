
import React from 'react';
import { useDrop } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DraggableElement from '@/components/DraggableElement';
import { PageElement } from '@/pages/Index';

interface PageCanvasProps {
  elements: PageElement[];
  selectedElement: PageElement | null;
  onSelectElement: (element: PageElement) => void;
  onReorderElements: (dragIndex: number, hoverIndex: number) => void;
  onAddElement: (type: PageElement['type'], parentId?: string) => void;
}

const PageCanvas: React.FC<PageCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onReorderElements,
  onAddElement,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item: { type: PageElement['type'] }) => {
      onAddElement(item.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Page Canvas</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={drop}
          className={`min-h-[500px] p-4 border-2 border-dashed rounded-lg transition-colors ${
            isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
        >
          {elements.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Drag elements here or click "Add" buttons to start building your page</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elements.map((element, index) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  index={index}
                  isSelected={selectedElement?.id === element.id}
                  onSelect={onSelectElement}
                  onReorder={onReorderElements}
                  onAddElement={onAddElement}
                />
              ))}
            </div>
          )}
          
          {isOver && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg flex items-center justify-center">
              <p className="text-blue-700 font-medium">Drop element here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageCanvas;
