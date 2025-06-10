
import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ElementToolbox from '@/components/ElementToolbox';
import PageCanvas from '@/components/PageCanvas';
import ElementEditor from '@/components/ElementEditor';

export interface PageElement {
  id: string;
  type: 'heading' | 'paragraph' | 'link' | 'button' | 'image' | 'csharp' | 'pagecode' | 'audio' | 'video';
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
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    elementId?: string;
    customCss?: string;
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

  const addElement = useCallback((type: PageElement['type']) => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      properties: getDefaultProperties(type)
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, []);

  const updateElement = useCallback((updatedElement: PageElement) => {
    setElements(prev => prev.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
    setSelectedElement(updatedElement);
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
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
    const indent = (level: number) => '  '.repeat(level);
    
    const renderElement = (element: PageElement, indentLevel: number = 3): string => {
      const baseIndent = indent(indentLevel);
      const idAttr = element.properties.elementId ? ` id="${element.properties.elementId}"` : '';
      const styleAttr = element.properties.customCss ? ` style="${element.properties.customCss}"` : '';
      
      switch (element.type) {
        case 'heading':
          const level = element.properties.level?.toLowerCase() || 'h1';
          const headingClasses = getBootstrapClasses(element);
          const headingStyles = getInlineStyles(element);
          return `${baseIndent}<${level}${idAttr}${headingClasses}${headingStyles}${styleAttr}>${element.content}</${level}>`;
        
        case 'paragraph':
          const paragraphClasses = getBootstrapClasses(element);
          const paragraphStyles = getInlineStyles(element);
          return `${baseIndent}<p${idAttr}${paragraphClasses}${paragraphStyles}${styleAttr}>${element.content}</p>`;
        
        case 'link':
          const linkClasses = getBootstrapClasses(element);
          const linkStyles = getInlineStyles(element);
          return `${baseIndent}<a${idAttr} href="${element.properties.href || '#'}"${linkClasses}${linkStyles}${styleAttr}>${element.content}</a>`;
        
        case 'button':
          const buttonClasses = getBootstrapClasses(element, 'btn btn-primary');
          const buttonStyles = getInlineStyles(element);
          return `${baseIndent}<a${idAttr} href="${element.properties.href || '#'}" class="btn btn-primary${buttonClasses.replace(' class="', '').replace('"', '')}"${buttonStyles}${styleAttr}>${element.content}</a>`;
        
        case 'image':
          const imageStyles = getInlineStyles(element, false);
          return `${baseIndent}<img${idAttr} src="${element.properties.src || ''}" alt="${element.properties.alt || ''}" class="img-fluid"${imageStyles}${styleAttr} />`;
        
        case 'audio':
          const audioAttrs = [
            element.properties.controls ? 'controls' : '',
            element.properties.autoplay ? 'autoplay' : '',
            element.properties.loop ? 'loop' : '',
            element.properties.muted ? 'muted' : ''
          ].filter(Boolean).join(' ');
          const audioStyles = getInlineStyles(element, false);
          return `${baseIndent}<div${getContainerStyles(element)}>
${baseIndent}  <h6>${element.content}</h6>
${baseIndent}  <audio${idAttr} src="${element.properties.src || ''}" ${audioAttrs}${audioStyles}${styleAttr}>
${baseIndent}    Your browser does not support the audio element.
${baseIndent}  </audio>
${baseIndent}</div>`;
        
        case 'video':
          const videoAttrs = [
            element.properties.controls ? 'controls' : '',
            element.properties.autoplay ? 'autoplay' : '',
            element.properties.loop ? 'loop' : '',
            element.properties.muted ? 'muted' : ''
          ].filter(Boolean).join(' ');
          const videoStyles = getInlineStyles(element, false);
          return `${baseIndent}<div${getContainerStyles(element)}>
${baseIndent}  <h6>${element.content}</h6>
${baseIndent}  <video${idAttr} src="${element.properties.src || ''}" ${videoAttrs} class="w-100"${videoStyles}${styleAttr}>
${baseIndent}    Your browser does not support the video element.
${baseIndent}  </video>
${baseIndent}</div>`;
        
        case 'csharp':
          const csharpCode = element.properties.scriptingMode === 'mvc' 
            ? `<% ${element.properties.code || ''} %>`
            : `@{\n    ${element.properties.code?.replace(/\n/g, '\n    ') || ''}\n}`;
          return `${baseIndent}<!-- ${element.content} (${element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'}) -->
${baseIndent}${csharpCode}`;
        
        case 'pagecode':
          const pageCode = element.properties.scriptingMode === 'mvc'
            ? `<%\n    ${element.properties.code?.replace(/\n/g, '\n    ') || ''}\n%>`
            : element.properties.code || '';
          return `${baseIndent}<!-- ${element.content} (${element.properties.scriptingMode === 'mvc' ? 'MVC' : 'Razor'}) -->
${baseIndent}${pageCode}`;
        
        default:
          return `${baseIndent}<!-- Unknown element type: ${element.type} -->`;
      }
    };

    const getBootstrapClasses = (element: PageElement, baseClass: string = ''): string => {
      const classes = [];
      if (baseClass) classes.push(baseClass);
      
      // Add size classes
      const sizeClass = getSizeBootstrapClass(element.properties.size);
      if (sizeClass) classes.push(sizeClass);
      
      return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
    };

    const getInlineStyles = (element: PageElement, includeText: boolean = true): string => {
      const styles = [];
      
      if (element.properties.backgroundColor && element.properties.backgroundColor !== 'transparent') {
        styles.push(`background-color: ${element.properties.backgroundColor}`);
      }
      
      if (includeText && element.properties.textColor) {
        styles.push(`color: ${element.properties.textColor}`);
      }
      
      return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
    };

    const getContainerStyles = (element: PageElement): string => {
      const styles = [];
      
      if (element.properties.backgroundColor && element.properties.backgroundColor !== 'transparent') {
        styles.push(`background-color: ${element.properties.backgroundColor}`);
      }
      
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
      return ` class="border border-secondary rounded p-3 mb-3"${styleAttr}`;
    };

    const htmlContent = elements.map(element => renderElement(element)).join('\n\n');
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Generated page from ASPxone Builder">
  <meta name="generator" content="ASPxone Builder">
  <title>Generated Page</title>
  
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Custom Styles -->
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
    }
    
    /* Custom utility classes */
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
  </style>
</head>
<body>
  <!-- Generated by ASPxone Builder on ${currentDate} at ${currentTime} -->
  
  <div class="container mt-4">
${htmlContent}
  </div>
  
  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
    case 'audio': return 'Audio Player';
    case 'video': return 'Video Player';
    case 'csharp': return 'C# Code Block';
    case 'pagecode': return 'C# Page Code';
    default: return '';
  }
}

function getDefaultProperties(type: PageElement['type']): PageElement['properties'] {
  switch (type) {
    case 'heading': return { level: 'H1', size: 'XL', backgroundColor: 'transparent', textColor: '#000000', elementId: '', customCss: '' };
    case 'paragraph': return { size: 'M', backgroundColor: 'transparent', textColor: '#000000', elementId: '', customCss: '' };
    case 'link': return { size: 'M', href: '#', backgroundColor: 'transparent', textColor: '#2563eb', elementId: '', customCss: '' };
    case 'button': return { size: 'M', href: '#', backgroundColor: '#2563eb', textColor: '#ffffff', elementId: '', customCss: '' };
    case 'image': return { src: '', alt: '', backgroundColor: 'transparent', elementId: '', customCss: '' };
    case 'audio': return { src: '', controls: true, autoplay: false, loop: false, muted: false, backgroundColor: 'transparent', elementId: '', customCss: '' };
    case 'video': return { src: '', controls: true, autoplay: false, loop: false, muted: false, backgroundColor: 'transparent', elementId: '', customCss: '' };
    case 'csharp': return { 
      code: '// Enter your C# code here\nstring message = "Hello World";',
      scriptingMode: 'razor',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      elementId: '',
      customCss: ''
    };
    case 'pagecode': return { 
      code: '// Enter your C# page code here\nstring pageTitle = "My Page";',
      scriptingMode: 'razor',
      backgroundColor: '#fff3cd',
      textColor: '#856404',
      elementId: '',
      customCss: ''
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

function getSizeBootstrapClass(size?: string): string {
  switch (size) {
    case 'XS': return 'fs-6';
    case 'S': return 'fs-6';
    case 'M': return 'fs-5';
    case 'L': return 'fs-4';
    case 'XL': return 'fs-3';
    case '2XL': return 'fs-2';
    case '3XL': return 'fs-1';
    default: return '';
  }
}

export default Index;
