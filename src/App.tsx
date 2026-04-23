import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  FileText,
  Code,
  AlignLeft,
  Settings,
  Layout,
  Image as ImageIcon,
  X,
  Edit2,
  Save,
  Download,
  Upload as UploadIcon,
  Maximize2,
} from 'lucide-react';

export default function CheatsheetApp() {
  const [entries, setEntries] = useState([]);

  // Estados del formulario
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]); // Ahora es un arreglo de imágenes

  // Opciones específicas del bloque actual
  const [blockFontSize, setBlockFontSize] = useState('inherit'); // inherit, small, normal, large
  const [fullWidth, setFullWidth] = useState(false); // Si ocupa las dos columnas

  // Opciones de personalización globales
  const [globalFontSize, setGlobalFontSize] = useState('normal');

  // Símbolos matemáticos y especiales comunes
  const specialSymbols = [
    'Σ',
    'π',
    '√',
    '∞',
    'α',
    'β',
    'θ',
    'Δ',
    '≤',
    '≥',
    '≠',
    '≈',
    '→',
    '∫',
    '∈',
    '∑',
    '∏',
  ];

  // Función para calcular los tamaños de fuente
  const getFontSizes = (sizeSetting) => {
    switch (sizeSetting) {
      case 'small':
        return {
          title: 'text-[11px]',
          code: 'text-[8px]',
          notes: 'text-[9px]',
        };
      case 'large':
        return {
          title: 'text-[14px]',
          code: 'text-[11px]',
          notes: 'text-[12px]',
        };
      case 'normal':
      default:
        return {
          title: 'text-[12px]',
          code: 'text-[9px]',
          notes: 'text-[10px]',
        };
    }
  };

  // Manejador para cargar MÚLTIPLES imágenes
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
    // Reseteamos el input para permitir subir la misma imagen otra vez si se borró
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const insertSymbol = (symbol) => {
    setNotes((prev) => prev + symbol);
  };

  const resetForm = () => {
    setTitle('');
    setCode('');
    setNotes('');
    setImages([]);
    setBlockFontSize('inherit');
    setFullWidth(false);
    setEditingId(null);
  };

  const handleSaveEntry = (e) => {
    e.preventDefault();
    if (!title.trim() && !code.trim() && !notes.trim() && images.length === 0)
      return;

    const entryData = {
      id: editingId || Date.now().toString(),
      title: title.trim(),
      code: code.trim(),
      notes: notes.trim(),
      images: images,
      customFontSize: blockFontSize,
      fullWidth: fullWidth,
    };

    if (editingId) {
      // Modo Edición: Actualizamos el existente
      setEntries(
        entries.map((entry) => (entry.id === editingId ? entryData : entry))
      );
    } else {
      // Modo Creación: Añadimos al final
      setEntries([...entries, entryData]);
    }

    resetForm();
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setTitle(entry.title || '');
    setCode(entry.code || '');
    setNotes(entry.notes || '');
    // Soporte retroactivo para archivos viejos que tenían 'image' en vez de 'images'
    setImages(entry.images || (entry.image ? [entry.image] : []));
    setBlockFontSize(entry.customFontSize || 'inherit');
    setFullWidth(entry.fullWidth || false);
  };

  const removeEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    if (editingId === id) resetForm();
  };

  // IMPORTAR / EXPORTAR DATOS
  const exportData = () => {
    if (entries.length === 0) {
      alert('No hay nada que exportar.');
      return;
    }
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(entries));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `cheatsheet_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          setEntries(importedData);
          alert('¡Cheatsheet cargada con éxito!');
        } else {
          alert('El formato del archivo no es válido.');
        }
      } catch (error) {
        alert(
          'Hubo un error al leer el archivo. Asegúrate de que es un archivo .json válido.'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(
        'El navegador bloqueó la pestaña nueva. Por favor, permite las ventanas emergentes (pop-ups).'
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mi Cheatsheet</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: letter portrait; margin: 1cm; }
            body {
              background-color: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-columns {
              column-count: 2;
              column-gap: 8mm;
            }
            .avoid-break {
              break-inside: avoid;
              page-break-inside: avoid;
              margin-bottom: 4mm;
            }
            /* Utilidad para expandir a todo el ancho de las columnas */
            .span-all {
              column-span: all;
              -webkit-column-span: all;
            }
            .no-print { display: none !important; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            setTimeout(() => { window.print(); }, 1000);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-200 p-4 font-sans flex flex-col xl:flex-row gap-6">
      <style>{`
        @media print {
          @page { size: letter portrait; margin: 1cm; }
          body { background-color: white; }
          .no-print { display: none !important; }
          #print-area {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; background: white;
          }
          .print-columns { column-count: 2; column-gap: 8mm; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; margin-bottom: 4mm; }
          .span-all { column-span: all; -webkit-column-span: all; }
        }
        /* Para que funcione el span-all visualmente en pantalla */
        .span-all { column-span: all; -webkit-column-span: all; }
      `}</style>

      {/* PANEL IZQUIERDO: FORMULARIO */}
      <div className="no-print w-full xl:w-1/3 flex flex-col gap-4">
        {/* Cabecera y Herramientas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-indigo-600 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Layout className="text-indigo-600" />
              Cheatsheet Pro
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Crea, edita, importa y exporta tus acordeones.
            </p>
          </div>

          <div className="flex gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={exportData}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <Download size={16} /> Exportar
            </button>
            <label className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition">
              <UploadIcon size={16} /> Importar
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Formulario Principal */}
        <div className="bg-white p-6 rounded-xl shadow-sm flex-grow flex flex-col transition-all duration-300 relative overflow-hidden">
          {editingId && (
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {editingId ? (
                <Edit2 size={20} className="text-amber-500" />
              ) : (
                <Plus size={20} className="text-gray-400" />
              )}
              {editingId ? 'Editando Bloque' : 'Nuevo Bloque'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-800 underline"
              >
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSaveEntry} className="space-y-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FileText size={14} /> Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Fórmula General"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Code size={14} /> Código (Opcional)
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Escribe el código aquí..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* SECCIÓN MULTI-IMAGEN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <ImageIcon size={14} /> Imágenes (Opcional)
              </label>

              {/* Grid de imágenes cargadas */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {images.map((imgStr, idx) => (
                    <div
                      key={idx}
                      className="relative inline-block border border-gray-300 bg-white rounded p-1"
                    >
                      <img
                        src={imgStr}
                        alt={`Preview ${idx}`}
                        className="h-16 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                id="multiImageInput"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
              />
            </div>

            {/* SECCIÓN NOTAS */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <AlignLeft size={14} /> Notas / Explicación
                </label>
              </div>

              <div className="flex flex-wrap gap-1 mb-2 bg-gray-50 p-1.5 rounded border border-gray-200">
                {specialSymbols.map((sym, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertSymbol(sym)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explicación, apuntes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* OPCIONES AVANZADAS DE BLOQUE */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Settings size={12} /> Ajustes del bloque
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 mb-1">
                    Tamaño de letra
                  </label>
                  <select
                    value={blockFontSize}
                    onChange={(e) => setBlockFontSize(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded p-1 outline-none focus:border-indigo-500"
                  >
                    <option value="inherit">Heredar de la hoja</option>
                    <option value="small">Pequeño</option>
                    <option value="normal">Normal</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer group mt-5">
                    <input
                      type="checkbox"
                      checked={fullWidth}
                      onChange={(e) => setFullWidth(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 group-hover:text-slate-900 flex items-center gap-1">
                      <Maximize2 size={12} /> Ocupar todo el ancho
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full text-white font-medium py-3 px-4 rounded-lg transition shadow-sm flex items-center justify-center gap-2
                ${
                  editingId
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
              {editingId ? (
                <>
                  <Save size={18} /> Guardar Cambios
                </>
              ) : (
                <>
                  <Plus size={18} /> Agregar a la Hoja
                </>
              )}
            </button>
          </form>
        </div>

        {/* Impresión y Ajuste Global */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Settings size={16} /> Tamaño Global
            </h2>
            <select
              value={globalFontSize}
              onChange={(e) => setGlobalFontSize(e.target.value)}
              className="text-sm border border-gray-300 rounded p-1 outline-none focus:border-indigo-500"
            >
              <option value="small">Súper Pequeño</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            disabled={entries.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition
              ${
                entries.length > 0
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Printer size={20} /> Guardar PDF
          </button>
        </div>
      </div>

      {/* PANEL DERECHO: VISTA PREVIA */}
      <div className="w-full xl:w-2/3 flex justify-center overflow-x-auto pb-8">
        <div
          id="print-area"
          className="bg-white shadow-2xl relative"
          style={{
            width: '215.9mm',
            minHeight: '279.4mm',
            padding: '10mm',
          }}
        >
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 no-print space-y-4 mt-32">
              <Layout size={64} strokeWidth={1} />
              <p className="text-lg">Tu hoja de trucos está vacía</p>
              <p className="text-sm">
                Importa un archivo o crea nuevos bloques.
              </p>
            </div>
          ) : (
            <div
              className="print-columns"
              style={{ columnCount: 2, columnGap: '8mm' }}
            >
              {entries.map((entry) => {
                // Calcular qué tamaño de fuente usar (¿el custom o el global?)
                const effectiveSize =
                  entry.customFontSize !== 'inherit'
                    ? entry.customFontSize
                    : globalFontSize;
                const sizes = getFontSizes(effectiveSize);

                // Normalizar array de imágenes por si importamos un archivo viejo
                const entryImages =
                  entry.images || (entry.image ? [entry.image] : []);

                return (
                  <div
                    key={entry.id}
                    className={`avoid-break mb-3 relative group rounded border transition
                      ${
                        editingId === entry.id
                          ? 'border-amber-400 bg-amber-50 shadow-sm'
                          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                      }
                      ${
                        entry.fullWidth ? 'span-all w-full clear-both mb-6' : ''
                      }`}
                    style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                  >
                    {/* Botones Flotantes (Edit & Delete) */}
                    <div className="no-print absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-white border border-gray-200 rounded p-1 shadow-sm z-10">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                        title="Editar bloque"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Eliminar bloque"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Título */}
                    {entry.title && (
                      <h3
                        className={`font-sans font-bold text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5 ${sizes.title} leading-tight`}
                      >
                        {entry.title}
                      </h3>
                    )}

                    {/* Código */}
                    {entry.code && (
                      <pre
                        className={`font-mono text-gray-800 bg-slate-50 border border-slate-200 p-2 rounded-md whitespace-pre-wrap overflow-wrap-anywhere ${sizes.code} leading-snug mb-1.5`}
                      >
                        {entry.code}
                      </pre>
                    )}

                    {/* Imágenes Múltiples */}
                    {entryImages.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-2 mb-1.5 ${
                          entryImages.length > 1
                            ? 'justify-between'
                            : 'justify-center'
                        }`}
                      >
                        {entryImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`img-${idx}`}
                            className="max-w-full h-auto rounded border border-gray-200 shadow-sm object-contain"
                            style={{
                              maxHeight: '200px',
                              // Si hay varias y no es full width, que se acomoden mejor
                              flex: entryImages.length > 1 ? '1 1 45%' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Notas */}
                    {entry.notes && (
                      <p
                        className={`font-sans text-gray-700 text-justify ${sizes.notes} leading-snug whitespace-pre-wrap`}
                      >
                        {entry.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
