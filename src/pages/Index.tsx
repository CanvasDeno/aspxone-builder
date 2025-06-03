import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ElementToolbox from '@/components/ElementToolbox';
import PageCanvas from '@/components/PageCanvas';
import ElementEditor from '@/components/ElementEditor';

export interface PageElement {
  id: string;
  type: 'heading' | 'paragraph' | 'link' | 'button' | 'image' | 'csharp' | 'pagecode' | 'row';
  content: string;
  properties: {
    level?: string;
    size?: string;
    href?: string;
    src?: string;
    alt?: string;
    code?: string;
    scriptingMode?: 'razor' | 'mvc';
    backgroundColor?: string;
    textColor?: string;
    children?: PageElement[];
    [key: string]: any;
  };
}

const Index = () => {
  const [elements, setElements] = useState<PageElement[]>([
    {
      id: '1',
      type: 'heading',
      content: 'New Heading',
      properties: { level: 'H1', size: 'XL' }
    }
  ]);
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(elements[0]);

  const addElement = useCallback((type: PageElement['type'], parentId?: string) => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      properties: getDefaultProperties(type)
    };

    if (parentId) {
      // Add to row
      setElements(prev => prev.map(el => {
        if (el.id === parentId && el.type === 'row') {
          const updatedElement = {
            ...el,
            properties: {
              ...el.properties,
              children: [...(el.properties.children || []), newElement]
            }
          };
          return updatedElement;
        }
        return el;
      }));
    } else {
      // Add to main canvas
      setElements(prev => [...prev, newElement]);
    }
    setSelectedElement(newElement);
  }, []);

  const updateElement = useCallback((updatedElement: PageElement) => {
    const updateInArray = (elements: PageElement[]): PageElement[] => {
      return elements.map(el => {
        if (el.id === updatedElement.id) {
          return updatedElement;
        }
        if (el.type === 'row' && el.properties.children) {
          return {
            ...el,
            properties: {
              ...el.properties,
              children: updateInArray(el.properties.children)
            }
          };
        }
        return el;
      });
    };

    setElements(prev => updateInArray(prev));
    setSelectedElement(updatedElement);
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    const deleteFromArray = (elements: PageElement[]): PageElement[] => {
      return elements.filter(el => {
        if (el.id === elementId) {
          return false;
        }
        if (el.type === 'row' && el.properties.children) {
          el.properties.children = deleteFromArray(el.properties.children);
        }
        return true;
      });
    };

    setElements(prev => deleteFromArray(prev));
    setSelectedElement(null);
  }, []);

  const reorderElements = useCallback((dragIndex: number, hoverIndex: number) => {
    setElements(prev => {
      const newElements = [...prev];
      const draggedElement = newElements[dragIndex];
      newElements.splice(dragIndex, 1);
      newElements.splice(hoverIndex, 0, draggedElement);
      return newElements;
    });
  }, []);

  const exportAsHtml = useCallback(() => {
    const renderElement = (element: PageElement): string => {
      switch (element.type) {
        case 'heading':
          const level = element.properties.level?.toLowerCase() || 'h1';
          const sizeClass = getSizeClass(element.properties.size);
          return `<${level} class="${sizeClass}">${element.content}</${level}>`;
        case 'paragraph':
          return `<p class="${getSizeClass(element.properties.size)}">${element.content}</p>`;
        case 'link':
          return `<a href="${element.properties.href || '#'}" class="${getSizeClass(element.properties.size)}">${element.content}</a>`;
        case 'button':
          return `<a href="${element.properties.href || '#'}" class="btn btn-primary ${getSizeClass(element.properties.size)}">${element.content}</a>`;
        case 'image':
          return `<img src="${element.properties.src || ''}" alt="${element.properties.alt || ''}" class="img-fluid" />`;
        case 'row':
          const childrenHtml = element.properties.children?.map(child => renderElement(child)).join('\n') || '';
          return `<div class="row">\n${childrenHtml}\n</div>`;
        case 'csharp':
          const csharpCode = element.properties.scriptingMode === 'mvc' 
            ? `<% ${element.properties.code || ''} %>`
            : `@{\n${element.properties.code || ''}\n}`;
          return csharpCode;
        case 'pagecode':
          const pageCode = element.properties.scriptingMode === 'mvc'
            ? `<%\n${element.properties.code || ''}\n%>`
            : element.properties.code || '';
          return pageCode;
        default:
          return '';
      }
    };

    const htmlContent = elements.map(renderElement).join('\n');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Page</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        ${htmlContent}
    </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.cshtml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [elements]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">ASPxone Builder</h1>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
            <div className="lg:col-span-1">
              <ElementToolbox onAddElement={addElement} onExport={exportAsHtml} />
            </div>
            
            <div className="lg:col-span-2">
              <PageCanvas 
                elements={elements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onReorderElements={reorderElements}
                onAddElement={addElement}
              />
            </div>
            
            <div className="lg:col-span-1">
              <ElementEditor 
                selectedElement={selectedElement}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
                onCancel={() => setSelectedElement(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

function getDefaultContent(type: PageElement['type']): string {
  switch (type) {
    case 'heading': return 'New Heading';
    case 'paragraph': return 'New paragraph text goes here.';
    case 'link': return 'New Link';
    case 'button': return 'New Button';
    case 'image': return 'Image';
    case 'row': return 'Row Container';
    case 'csharp': return 'C# Code Block';
    case 'pagecode': return 'C# Page Code';
    default: return '';
  }
}

function getDefaultProperties(type: PageElement['type']): PageElement['properties'] {
  switch (type) {
    case 'heading': return { level: 'H1', size: 'XL', backgroundColor: 'transparent', textColor: '#000000' };
    case 'paragraph': return { size: 'M', backgroundColor: 'transparent', textColor: '#000000' };
    case 'link': return { size: 'M', href: '#', backgroundColor: 'transparent', textColor: '#2563eb' };
    case 'button': return { size: 'M', href: '#', backgroundColor: '#2563eb', textColor: '#ffffff' };
    case 'image': return { src: '', alt: '', backgroundColor: 'transparent' };
    case 'row': return { children: [], backgroundColor: 'transparent' };
    case 'csharp': return { 
      code: '// Enter your C# code here\nstring message = "Hello World";',
      scriptingMode: 'razor',
      backgroundColor: '#f8f9fa',
      textColor: '#212529'
    };
    case 'pagecode': return { 
      code: '// Enter your C# page code here\nstring pageTitle = "My Page";',
      scriptingMode: 'razor',
      backgroundColor: '#fff3cd',
      textColor: '#856404'
    };
    default: return {};
  }
}

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

export default Index;
