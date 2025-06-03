
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { PageElement } from '@/pages/Index';

interface DraggableElementProps {
  element: PageElement;
  index: number;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  index,
  isSelected,
  onSelect,
  onReorder,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'canvas-element',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'canvas-element',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const renderElement = () => {
    const sizeClass = getSizeClass(element.properties.size);
    const baseClass = `${sizeClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}`;

    switch (element.type) {
      case 'heading':
        const HeadingTag = element.properties.level?.toLowerCase() as keyof JSX.IntrinsicElements || 'h1';
        return React.createElement(HeadingTag, { className: baseClass }, element.content);
      case 'paragraph':
        return <p className={baseClass}>{element.content}</p>;
      case 'link':
        return <a href={element.properties.href || '#'} className={`${baseClass} text-blue-600 underline`}>{element.content}</a>;
      case 'button':
        return <a href={element.properties.href || '#'} className={`${baseClass} px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block`}>{element.content}</a>;
      case 'image':
        return (
          <img 
            src={element.properties.src || 'https://via.placeholder.com/300x200'} 
            alt={element.properties.alt || ''} 
            className={`${baseClass} max-w-full h-auto`}
          />
        );
      case 'csharp':
        const csharpStyle = {
          backgroundColor: element.properties.backgroundColor || '#f8f9fa',
          color: element.properties.textColor || '#212529'
        };
        const csharpCode = element.properties.scriptingMode === 'mvc' 
          ? `<% ${element.properties.code || ''} %>`
          : `@{\n${element.properties.code || ''}\n}`;
        return (
          <div className={`${baseClass} border border-gray-300 rounded p-3`} style={csharpStyle}>
            <div className="text-sm font-semibold mb-2">
              {element.content} ({element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'})
            </div>
            <pre className="text-xs font-mono p-2 rounded overflow-auto" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {csharpCode}
            </pre>
          </div>
        );
      case 'pagecode':
        const pageCodeStyle = {
          backgroundColor: element.properties.backgroundColor || '#fff3cd',
          color: element.properties.textColor || '#856404'
        };
        const pageCode = element.properties.scriptingMode === 'mvc'
          ? `<%\n${element.properties.code || ''}\n%>`
          : element.properties.code || '';
        return (
          <div className={`${baseClass} border border-yellow-300 rounded p-3`} style={pageCodeStyle}>
            <div className="text-sm font-semibold mb-2">
              {element.content} ({element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'})
            </div>
            <pre className="text-xs font-mono p-2 rounded overflow-auto" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {pageCode}
            </pre>
          </div>
        );
      default:
        return <div className={baseClass}>{element.content}</div>;
    }
  };

  return (
    <div
      ref={ref}
      className={`cursor-pointer p-2 rounded transition-all duration-200 ${
        isSelected ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onSelect(element)}
    >
      {renderElement()}
    </div>
  );
};

function getSizeClass(size?: string): string {
  switch (size) {
    case 'XS': return 'text-xs';
    case 'S': return 'text-sm';
    case 'M': return 'text-base';
    case 'L': return 'text-lg';
    case 'XL': return 'text-xl';
    case '2XL': return 'text-2xl';
    case '3XL': return 'text-3xl';
    default: return 'text-base';
  }
}

export default DraggableElement;
