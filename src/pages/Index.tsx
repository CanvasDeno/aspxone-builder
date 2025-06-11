import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ElementToolbox from '@/components/ElementToolbox';
import PageCanvas from '@/components/PageCanvas';
import ElementEditor from '@/components/ElementEditor';

export interface PageElement {
  id: string;
  type: 'heading' | 'paragraph' | 'link' | 'button' | 'image' | 'csharp' | 'pagecode' | 'audio' | 'video' | 'navbar' | 'footer' | 'textbox';
  content: string;
  properties: {
    level?: string;
    size?: string;
    href?: string;
    src?: string;
    alt?: string;
    code?: string;
    scriptingMode?: 'razor' | 'mvc' | 'javascript';
    backgroundColor?: string;
    textColor?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    elementId?: string;
    customCss?: string;
    navItems?: Array<{ text: string; icon?: string; href: string }>;
    footerText?: string;
    placeholder?: string;
    inputType?: string;
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
    
    // Helper function to convert markdown to HTML
    const convertMarkdownToHtml = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    };
    
    const renderElement = (element: PageElement, indentLevel: number = 3): string => {
      const baseIndent = indent(indentLevel);
      const idAttr = element.properties.elementId ? ` id="${element.properties.elementId}"` : '';
      
      // Build style attribute
      const styles = [];
      if (element.properties.backgroundColor && element.properties.backgroundColor !== 'transparent') {
        styles.push(`background-color: ${element.properties.backgroundColor}`);
      }
      if (element.properties.textColor) {
        styles.push(`color: ${element.properties.textColor}`);
      }
      if (element.properties.customCss) {
        styles.push(element.properties.customCss);
      }
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
      
      switch (element.type) {
        case 'heading':
          const level = element.properties.level?.toLowerCase() || 'h1';
          const headingClasses = getBootstrapClasses(element);
          const headingContent = convertMarkdownToHtml(element.content);
          return `${baseIndent}<${level}${idAttr}${headingClasses}${styleAttr}>${headingContent}</${level}>`;
        
        case 'paragraph':
          const paragraphClasses = getBootstrapClasses(element);
          const paragraphContent = convertMarkdownToHtml(element.content);
          return `${baseIndent}<p${idAttr}${paragraphClasses}${styleAttr}>${paragraphContent}</p>`;
        
        case 'link':
          const linkClasses = getBootstrapClasses(element);
          const linkContent = convertMarkdownToHtml(element.content);
          return `${baseIndent}<a${idAttr} href="${element.properties.href || '#'}"${linkClasses}${styleAttr}>${linkContent}</a>`;
        
        case 'button':
          const buttonContent = convertMarkdownToHtml(element.content);
          const buttonStyles = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
          return `${baseIndent}<a${idAttr} href="${element.properties.href || '#'}" class="btn btn-primary"${buttonStyles}>${buttonContent}</a>`;
        
        case 'image':
          return `${baseIndent}<img${idAttr} src="${element.properties.src || ''}" alt="${element.properties.alt || ''}" class="img-fluid"${styleAttr} />`;
        
        case 'textbox':
          const inputType = element.properties.inputType || 'text';
          const placeholder = element.properties.placeholder || '';
          return `${baseIndent}<input${idAttr} type="${inputType}" placeholder="${placeholder}" class="form-control"${styleAttr} />`;
        
        case 'navbar':
          const navItems = element.properties.navItems || [];
          const navItemsHtml = navItems.map((item: any) => 
            `${baseIndent}    <li class="nav-item">
${baseIndent}      <a class="nav-link" href="${item.href || '#'}">
${baseIndent}        ${item.icon ? `<i class="${item.icon}"></i> ` : ''}${item.text}
${baseIndent}      </a>
${baseIndent}    </li>`
          ).join('\n');
          
          return `${baseIndent}<nav${idAttr} class="navbar navbar-expand-lg navbar-light bg-light"${styleAttr}>
${baseIndent}  <div class="container">
${baseIndent}    <a class="navbar-brand" href="#">${element.content}</a>
${baseIndent}    <div class="navbar-nav">
${navItemsHtml}
${baseIndent}    </div>
${baseIndent}  </div>
${baseIndent}</nav>`;
        
        case 'footer':
          const footerText = element.properties.footerText || element.content;
          return `${baseIndent}<footer${idAttr} class="bg-light text-center py-3"${styleAttr}>
${baseIndent}  <div class="container">
${baseIndent}    <p class="mb-0">${convertMarkdownToHtml(footerText)}</p>
${baseIndent}  </div>
${baseIndent}</footer>`;
        
        case 'audio':
          const audioAttrs = [
            element.properties.controls ? 'controls' : '',
            element.properties.autoplay ? 'autoplay' : '',
            element.properties.loop ? 'loop' : '',
            element.properties.muted ? 'muted' : ''
          ].filter(Boolean).join(' ');
          return `${baseIndent}<div class="border border-secondary rounded p-3 mb-3"${styleAttr}>
${baseIndent}  <h6>${element.content}</h6>
${baseIndent}  <audio${idAttr} src="${element.properties.src || ''}" ${audioAttrs} class="w-100">
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
          return `${baseIndent}<div class="border border-secondary rounded p-3 mb-3"${styleAttr}>
${baseIndent}  <h6>${element.content}</h6>
${baseIndent}  <video${idAttr} src="${element.properties.src || ''}" ${videoAttrs} class="w-100">
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
          let pageCode;
          if (element.properties.scriptingMode === 'javascript') {
            pageCode = `<script>
    ${element.properties.code?.replace(/\n/g, '\n    ') || ''}
</script>`;
          } else if (element.properties.scriptingMode === 'mvc') {
            pageCode = `<%\n    ${element.properties.code?.replace(/\n/g, '\n    ') || ''}\n%>`;
          } else {
            pageCode = element.properties.code || '';
          }
          return `${baseIndent}<!-- ${element.content} (${element.properties.scriptingMode === 'mvc' ? 'MVC' : element.properties.scriptingMode === 'javascript' ? 'JavaScript' : 'Razor'}) -->
${baseIndent}${pageCode}`;
        
        default:
          return `${baseIndent}<!-- Unknown element type: ${element.type} -->`;
      }
    };

    const getBootstrapClasses = (element: PageElement): string => {
      const classes = [];
      
      // Add size classes
      const sizeClass = getSizeBootstrapClass(element.properties.size);
      if (sizeClass) classes.push(sizeClass);
      
      return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
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
    case 'pagecode': return 'Page Code';
    case 'navbar': return 'My Website';
    case 'footer': return '© 2023 My Website. All rights reserved.';
    case 'textbox': return 'Text Input';
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
      code: '// Enter your page code here\nconsole.log("Hello World");',
      scriptingMode: 'javascript',
      backgroundColor: '#fff3cd',
      textColor: '#856404',
      elementId: '',
      customCss: ''
    };
    case 'navbar': return {
      navItems: [
        { text: 'Home', href: '#' },
        { text: 'About', href: '#about' },
        { text: 'Contact', href: '#contact' }
      ],
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      elementId: '',
      customCss: ''
    };
    case 'footer': return {
      footerText: '© 2023 My Website. All rights reserved.',
      backgroundColor: '#f8f9fa',
      textColor: '#6c757d',
      elementId: '',
      customCss: ''
    };
    case 'textbox': return {
      placeholder: 'Enter text...',
      inputType: 'text',
      backgroundColor: 'transparent',
      textColor: '#000000',
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
