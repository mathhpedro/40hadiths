# 40 Hadiths — Al-Arba'in An-Nawawiyyah

Plataforma web (PWA, mobile-first) para estudar os **42 hadiths do Imam An-Nawawi**
com árabe original, transliteração e tradução **bilíngue (PT/EN)** — pensada como
material de apoio às aulas com o sheikh e ao estudo/memorização individual e em grupo.

Interface com estética **Liquid Glass** e identidade visual islâmica (tons de verde,
dourado suave e padrão geométrico), sem imagens de seres animados.

> **Revisão religiosa:** o árabe, a vocalização (tashkil) e as traduções vêm da
> compilação clássica e **devem ser revisados com o sheikh antes de uso litúrgico.**
> A versão dos dados aparece em *Ajustes*.

---

## Recursos

- **42 hadiths** + **10 hadiths complementares**, cada um com árabe (RTL), transliteração,
  tradução, narrador, grau, fontes, nota de transmissão, ensinamentos e temas.
- **Bilíngue PT/EN** com alternância global persistida. O árabe e a transliteração não
  mudam com o idioma — mudam a tradução, os ensinamentos e os rótulos.
- **Lista** com busca (texto/tema/narrador, sem depender de acentos) e filtros por
  **tema** e por **fonte** (Bukhari, Muslim, Tirmidhi…).
- **Detalhe** com seções *Sobre / Ensinamentos / Temas*, esconder/mostrar transliteração
  e tradução, anotações locais e navegação anterior/próximo.
- **Memorização**: flashcards (frente árabe / verso tradução) com repetição espaçada
  simples (*sei / quase / não sei*) e progresso salvo no dispositivo.
- **Modo aula / apresentação**: tela cheia, alto contraste, um hadith por vez, com
  atalhos para mostrar/ocultar cada seção ao vivo (ideal para projetar).
- **Ajustes**: idioma, tema claro/escuro/sistema, tamanho do texto, fonte árabe
  (Amiri / Scheherazade New), reduzir animações e padrões de exibição.
- **PWA**: instalável e utilizável **off-line** (conteúdo, fontes e dados são
  pré-armazenados em cache pelo service worker).

## Stack

React + Vite + TypeScript · Tailwind CSS v4 · React Router (HashRouter) ·
`vite-plugin-pwa` · fontes self-hosted via `@fontsource` (Amiri, Scheherazade New, Inter).
Sem back-end — todo o estado (idioma, preferências, progresso, anotações) fica em
`localStorage`.

## Rodar localmente

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # gera dist/ (typecheck + build de produção)
npm run preview    # serve o build de produção localmente
```

## Atualizar o conteúdo (os hadiths)

Todo o conteúdo vem de **`src/data/40-hadiths-nawawi.json`**. Para corrigir um texto,
edite esse arquivo (mantendo a estrutura de campos) e rode `npm run build`.
O campo `meta.versao` serve para registrar a versão revisada.

Estrutura resumida:

```jsonc
{
  "meta":    { "colecao", "colecao_en", "autor", "total_hadiths", "idiomas", "versao", "nota" },
  "hadiths": [ { "number", "title_pt/en", "arabic", "transliteration",
                 "translation_pt/en", "narrator", "grade", "sources[]",
                 "chain_note_pt/en", "teachings_pt/en[]", "themes_pt/en[]" } ],
  "related_hadiths": [ { "id", "...", "connection_pt/en", "themes_pt/en[]" } ]
}
```

O índice de temas e o índice de fontes usados nos filtros são derivados
automaticamente desses campos (`src/data/index.ts`).

## Adicionar um 3º idioma

Os rótulos de interface ficam em `src/i18n/strings.ts` (o TypeScript exige que todos
os idiomas tenham as mesmas chaves). O conteúdo dos hadiths viria de novos campos
`*_xx` no JSON e de um caso a mais em `localizeHadith`/`localizeRelated`.

## Ícones (PWA / favicon)

Os PNGs em `public/icons/` já estão versionados. Para regerá-los a partir do SVG mestre:

```bash
npm i -D sharp && node scripts/generate-icons.mjs
```

## Deploy

O build é 100% estático. Como usa `base: './'` (caminhos relativos) e HashRouter,
funciona em qualquer host — inclusive em subcaminho (ex.: GitHub Pages `/40hadiths/`)
sem regras de rewrite.

- **Netlify / Vercel:** build `npm run build`, diretório de publicação `dist`.
- **GitHub Pages:** publique o conteúdo de `dist/` (o `.nojekyll` já vai junto).

## Roadmap (fases futuras)

- [ ] **Áudio de recitação** por hadith (campo de URL/arquivo por hadith + player).
- [ ] **Sincronização em grupo** de progresso e anotações (ex.: back-end leve como
      Supabase) — hoje tudo é local ao dispositivo.
- [ ] Painel do facilitador para montar a "sessão da semana" e exportar PDF.
- [ ] Comentário do sheikh por hadith.
