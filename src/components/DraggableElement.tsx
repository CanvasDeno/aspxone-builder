
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
      color: element.properties.textColor || 'inherit',
      ...(element.properties.customCss ? parseCssString(element.properties.customCss) : {})
    };

    const elementProps = {
      id: element.properties.elementId || undefined,
      className: baseClass,
      style: elementStyle
    };

    switch (element.type) {
      case 'heading':
        const HeadingTag = element.properties.level?.toLowerCase() as keyof JSX.IntrinsicElements || 'h1';
        return React.createElement(HeadingTag, elementProps, element.content);
      case 'paragraph':
        return <p {...elementProps}>{element.content}</p>;
      case 'link':
        return (
          <a 
            {...elementProps}
            href={element.properties.href || '#'} 
            className={`${baseClass} underline`}
          >
            {element.content}
          </a>
        );
      case 'button':
        return (
          <a 
            {...elementProps}
            href={element.properties.href || '#'} 
            className={`${baseClass} px-4 py-2 rounded hover:opacity-80 inline-block`}
          >
            {element.content}
          </a>
        );
      case 'image':
        return (
          <div style={{ backgroundColor: elementStyle.backgroundColor, ...parseCssString(element.properties.customCss || '') }}>
            <img 
              id={element.properties.elementId || undefined}
              src={element.properties.src || 'https://via.placeholder.com/300x200'} 
              alt={element.properties.alt || ''} 
              className={`${baseClass} max-w-full h-auto`}
            />
          </div>
        );
      case 'audio':
        return (
          <div {...elementProps} className={`${baseClass} border border-gray-300 rounded p-3`}>
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
          <div {...elementProps} className={`${baseClass} border border-gray-300 rounded p-3`}>
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
      case 'csharp':
        const csharpCode = element.properties.scriptingMode === 'mvc' 
          ? `<% ${element.properties.code || ''} %>`
          : `@{\n${element.properties.code || ''}\n}`;
        return (
          <div {...elementProps} className={`${baseClass} border border-gray-300 rounded p-3`}>
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
          <div {...elementProps} className={`${baseClass} border border-yellow-300 rounded p-3`}>
            <div className="text-sm font-semibold mb-2">
              {element.content} ({element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'})
            </div>
            <pre className="text-xs font-mono p-2 rounded overflow-auto" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {pageCode}
            </pre>
          </div>
        );
      default:
        return <div {...elementProps}>{element.content}</div>;
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

function parseCssString(cssString: string): React.CSSProperties {
  const styles: React.CSSProperties = {};
  if (!cssString) return styles;
  
  try {
    const declarations = cssString.split(';').filter(decl => decl.trim());
    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(str => str.trim());
      if (property && value) {
        const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        (styles as any)[camelCaseProperty] = value;
      }
    });
  } catch (error) {
    console.warn('Error parsing CSS string:', error);
  }
  
  return styles;
}

export default DraggableElement;
