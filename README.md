# Cognix Web App

Versao web do Cognix criada com Next.js, React, TypeScript e Tailwind CSS.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Arquitetura

O projeto usa uma organizacao por modulos com separacao inspirada em MVC.

### `app/`

Camada de roteamento do Next.js. Os arquivos `page.tsx` e `layout.tsx` devem ser finos e delegar renderizacao para controllers ou views.

### `src/modules/<module>/model`

Dados, tipos, constantes e contratos do modulo.

Exemplos no modulo `auth`:

- Conteudo das telas
- Rotas da autenticacao
- Provedores sociais

### `src/modules/<module>/controller`

Orquestracao da tela e regras de interacao.

Exemplos no modulo `auth`:

- Controllers de pagina
- Hooks de formulario
- Handlers de submit
- Estado de UI ligado a comportamento

### `src/modules/<module>/view`

Componentes visuais, telas e estilos do modulo.

Exemplos no modulo `auth`:

- `view/screens`
- `view/components`
- `view/styles`

### `src/shared`

Codigo compartilhado entre modulos. Tambem segue a mesma ideia:

- `shared/model`
- `shared/view`

## Estilos

O arquivo `app/globals.css` e apenas o ponto de entrada global.

```css
@import "tailwindcss";
@import "../src/shared/view/styles/global.css";
@import "../src/modules/auth/view/styles/auth.css";
```

Estilos globais ficam em `src/shared/view/styles/global.css`. A interface das telas usa Tailwind direto nos componentes. O arquivo `src/modules/auth/view/styles/auth.css` deve ficar restrito a animacoes e regras que nao sao ergonomicas em utilitarios Tailwind.
