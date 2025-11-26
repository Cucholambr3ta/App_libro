# Tailwind CSS Integration

## ✅ Configuración Completada

Tailwind CSS ha sido integrado al proyecto frontend manteniendo compatibilidad con los estilos existentes.

### Instalado
- tailwindcss ^3.x
- postcss
- autoprefixer

### Archivos de Configuración
- `tailwind.config.js` - Tema personalizado con colores del diseño original
- `postcss.config.js` - Configuración de PostCSS
- `src/index.css` - Directivas de Tailwind agregadas

### Tema Personalizado

Los colores del diseño original están disponibles como utilidades de Tailwind:

```jsx
// Ejemplos de uso
<div className="bg-primary text-white">...</div>
<div className="bg-dark-card hover:bg-dark-card-hover">...</div>
<h1 className="font-heading text-primary">...</h1>
<p className="font-body text-secondary">...</p>
```

### Colores Disponibles
```
primary         # hsl(260, 85%, 58%)
primary-dark    # hsl(260, 85%, 48%)
primary-light   # hsl(260, 85%, 68%)
secondary       # hsl(340, 82%, 52%)
accent          # hsl(180, 80%, 45%)
dark            # hsl(230, 17%, 14%)
dark-secondary  # hsl(232, 19%, 19%)
dark-card       # hsl(228, 25%, 23%)
dark-card-hover # hsl(228, 25%, 28%)
```

### Fuentes
```
font-body     # Inter, system fonts
font-heading  # Outfit, Inter
```

## 🔄 Compatibilidad

El proyecto ahora soporta **ambos sistemas**:
- ✅ Vanilla CSS (existente) - todas las clases `.btn`, `.card`, etc.
- ✅ Tailwind CSS (nuevo) - utilidades `bg-`, `text-`, `flex`, etc.

Puedes usar cualquiera de los dos o combinarlos según prefieras.

## 📝 Ejemplos

### Antes (Vanilla CSS)
```jsx
<button className="btn btn-primary">
  Click me
</button>
```

### Ahora con Tailwind
```jsx
<button className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition">
  Click me
</button>
```

### O combinados
```jsx
<button className="btn bg-gradient-to-r from-primary to-secondary">
  Click me
</button>
```

## 🚀 Next Steps

Si deseas refactorizar los componentes existentes para usar solo Tailwind, puedes hacerlo gradualmente sin romper nada.
