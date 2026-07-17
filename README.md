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
- **Aulas e confirmação de presença**: agende os encontros (data/hora, hadiths da
  sessão, local, notas) e cada membro confirma presença (*Vou / Talvez / Não vou*);
  todos veem quem vai. Aparece a "próxima aula" na Home. Requer login (Supabase).
- **Ajustes**: idioma, tema claro/escuro/sistema, tamanho do texto, fonte árabe
  (Amiri / Scheherazade New), reduzir animações e padrões de exibição.
- **PWA**: instalável e utilizável **off-line** (conteúdo, fontes e dados são
  pré-armazenados em cache pelo service worker).

## Stack

React + Vite + TypeScript · Tailwind CSS v4 · React Router (HashRouter) ·
`vite-plugin-pwa` · fontes self-hosted via `@fontsource` (Amiri, Scheherazade New, Inter).
Todo o estado (idioma, preferências, progresso, anotações) fica em `localStorage` e
funciona **100% off-line**. A sincronização na nuvem (Supabase) é **opcional** — o app
inteiro funciona sem login.

## Rodar localmente

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # gera dist/ (typecheck + build de produção)
npm run preview    # serve o build de produção localmente
```

## Sincronização na nuvem (Supabase) — opcional

Em *Ajustes → Conta*, cada pessoa pode criar uma conta (e-mail + senha) para
**sincronizar seu próprio progresso e anotações entre dispositivos** (ex.: o celular e
a tela projetada na aula). Sem login, tudo continua funcionando localmente.

- **Projeto:** `40-hadiths` (região São Paulo, `sa-east-1`), ref `uhguulzgyfyvpieuaodp`.
- **Tabelas:** `progress` e `notes` (uma linha por hadith por usuário), `profiles`,
  e — para as aulas — `sessions` (aulas agendadas) e `attendance` (confirmações).
  Todas com **Row Level Security**: progresso/anotações são privados de cada usuário;
  as aulas e confirmações são visíveis a todos os membros logados, mas cada um só
  edita as próprias (e o criador gerencia a própria aula).
- **Chaves:** a URL e a chave *publishable* já vêm embutidas (`src/lib/supabase.ts`) —
  são públicas por natureza; a segurança vem do RLS. Para apontar para outro projeto,
  defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (veja `.env.example`).
- **Estratégia:** *last-writer-wins* por hadith (carimbo de tempo); o local serve de
  cache off-line e é reconciliado ao entrar e ao reabrir o app.

> **Cadastro sem fricção (recomendado para a turma):** por padrão o Supabase pede
> confirmação por e-mail. Para liberar o login imediato, no painel do Supabase vá em
> *Authentication → Sign In / Providers → Email* e desative *Confirm email*.

O schema está versionado em `supabase/migrations/`.

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
sem regras de rewrite. O `vercel.json` já traz build e diretório de saída.

**Vercel (recomendado):**
1. Em [vercel.com/new](https://vercel.com/new), importe o repositório `mathhpedro/40hadiths`.
2. O framework (Vite) é detectado automaticamente — **nenhuma variável de ambiente é
   necessária** (as chaves do Supabase já vêm embutidas). É só *Deploy*.
3. Cada `git push` passa a gerar um deploy novo. Defina a *Production Branch* para o
   branch que você usa (ou faça merge para a branch padrão).

**Netlify:** build `npm run build`, publicação `dist`.
**GitHub Pages:** publique o conteúdo de `dist/` (o `.nojekyll` já vai junto).

## Roadmap (fases futuras)

- [x] **Sincronização na nuvem** (Supabase) de progresso e anotações por usuário.
- [ ] **Áudio de recitação** por hadith (campo de URL/arquivo por hadith + player).
- [ ] Notas/anotações **compartilhadas com o grupo** (hoje cada conta é individual).
- [ ] Painel do facilitador para montar a "sessão da semana" e exportar PDF.
- [ ] Comentário do sheikh por hadith.
