
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
    accept: ['canvas-element', 'element'],
    hover: (item: { index?: number; type?: string }) => {
      if (!ref.current) return;
      
      // Handle reordering
      if (item.index !== undefined) {
        const dragIndex = item.index;
        const hoverIndex = index;
        
        if (dragIndex === hoverIndex) return;
        
        onReorder(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
  });

  drag(drop(ref));

  const renderElement = () => {
    const sizeClass = getSizeClass(element.properties.size);
    const baseClass = `${sizeClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}`;
    
    const elementStyle = {
      backgroundColor: element.properties.backgroundColor === 'transparent' ? 'transparent' : element.properties.backgroundColor || 'transparent',
      color: element.properties.textColor || 'inherit'
    };

    switch (element.type) {
      case 'heading':
        const HeadingTag = element.properties.level?.toLowerCase() as keyof JSX.IntrinsicElements || 'h1';
        return React.createElement(HeadingTag, { 
          className: baseClass,
          style: elementStyle
        }, element.content);
      case 'paragraph':
        return <p className={baseClass} style={elementStyle}>{element.content}</p>;
      case 'link':
        return (
          <a 
            href={element.properties.href || '#'} 
            className={`${baseClass} underline`}
            style={elementStyle}
          >
            {element.content}
          </a>
        );
      case 'button':
        return (
          <a 
            href={element.properties.href || '#'} 
            className={`${baseClass} px-4 py-2 rounded hover:opacity-80 inline-block`}
            style={elementStyle}
          >
            {element.content}
          </a>
        );
      case 'image':
        return (
          <div style={{ backgroundColor: elementStyle.backgroundColor }}>
            <img 
              src={element.properties.src || 'https://via.placeholder.com/300x200'} 
              alt={element.properties.alt || ''} 
              className={`${baseClass} max-w-full h-auto`}
            />
          </div>
        );
      case 'audio':
        return (
          <div className={`${baseClass} border border-gray-300 rounded p-3`} style={elementStyle}>
            <div className="text-sm font-semibold mb-2">{element.content}</div>
            <audio 
              src={element.properties.src || ''} 
              controls={element.properties.controls}
              autoPlay={element.properties.autoplay}
              loop={element.properties.loop}
              muted={element.properties.muted}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'video':
        return (
          <div className={`${baseClass} border border-gray-300 rounded p-3`} style={elementStyle}>
            <div className="text-sm font-semibold mb-2">{element.content}</div>
            <video 
              src={element.properties.src || ''} 
              controls={element.properties.controls}
              autoPlay={element.properties.autoplay}
              loop={element.properties.loop}
              muted={element.properties.muted}
              className="w-full max-w-md"
            >
              Your browser does not support the video element.
            </video>
          </div>
        );
      case 'inline-row':
        return (
          <div className={`${baseClass} border border-dashed border-gray-400 rounded p-3 min-h-[60px]`} style={elementStyle}>
            <div className="text-sm font-semibold mb-2">{element.content}</div>
            <div className="flex flex-row gap-2 items-center flex-wrap">
              {element.properties.children && element.properties.children.length > 0 ? (
                element.properties.children.map((child: PageElement, childIndex: number) => (
                  <div key={child.id} className="inline-block">
                    {renderChildElement(child)}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm italic">Drop elements here to create an inline row</div>
              )}
            </div>
          </div>
        );
      case 'csharp':
        const csharpCode = element.properties.scriptingMode === 'mvc' 
          ? `<% ${element.properties.code || ''} %>`
          : `@{\n${element.properties.code || ''}\n}`;
        return (
          <div className={`${baseClass} border border-gray-300 rounded p-3`} style={elementStyle}>
            <div className="text-sm font-semibold mb-2">
              {element.content} ({element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'})
            </div>
            <pre className="text-xs font-mono p-2 rounded overflow-auto" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {csharpCode}
            </pre>
          </div>
        );
      case 'pagecode':
        const pageCode = element.properties.scriptingMode === 'mvc'
          ? `<%\n${element.properties.code || ''}\n%>`
          : element.properties.code || '';
        return (
          <div className={`${baseClass} border border-yellow-300 rounded p-3`} style={elementStyle}>
            <div className="text-sm font-semibold mb-2">
              {element.content} ({element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'})
            </div>
            <pre className="text-xs font-mono p-2 rounded overflow-auto" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {pageCode}
            </pre>
          </div>
        );
      default:
        return <div className={baseClass} style={elementStyle}>{element.content}</div>;
    }
  };

  const renderChildElement = (child: PageElement) => {
    const sizeClass = getSizeClass(child.properties.size);
    const childStyle = {
      backgroundColor: child.properties.backgroundColor === 'transparent' ? 'transparent' : child.properties.backgroundColor || 'transparent',
      color: child.properties.textColor || 'inherit'
    };

    switch (child.type) {
      case 'button':
        return (
          <a 
            href={child.properties.href || '#'} 
            className={`${sizeClass} px-3 py-1 rounded hover:opacity-80 inline-block text-sm`}
            style={childStyle}
          >
            {child.content}
          </a>
        );
      case 'image':
        return (
          <img 
            src={child.properties.src || 'https://via.placeholder.com/100x60'} 
            alt={child.properties.alt || ''} 
            className={`${sizeClass} h-12 w-auto object-cover rounded`}
          />
        );
      default:
        return <span className={sizeClass} style={childStyle}>{child.content}</span>;
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
