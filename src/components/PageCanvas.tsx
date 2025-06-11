
import React from 'react';
import { useDrop } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import DraggableElement from '@/components/DraggableElement';
import { PageElement } from '@/pages/Index';

interface PageCanvasProps {
  elements: PageElement[];
  selectedElement: PageElement | null;
  onSelectElement: (element: PageElement) => void;
  onReorderElements: (dragIndex: number, hoverIndex: number) => void;
  onAddElement: (type: PageElement['type']) => void;
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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg font-semibold">Page Canvas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div
            ref={drop}
            className={`min-h-[500px] p-4 border-2 border-dashed rounded-lg transition-colors mx-4 my-4 flex flex-col ${
              isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          >
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Drag elements here or click "Add" buttons to start building your page</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col">
                {elements.map((element, index) => (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    index={index}
                    isSelected={selectedElement?.id === element.id}
                    onSelect={onSelectElement}
                    onReorder={onReorderElements}
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PageCanvas;
