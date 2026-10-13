# Perfil de Identidade Visual: Editorial Quiet Luxury (Atmospheric Minimalist)

Este perfil estabelece o padrão arquitetônico e estético para Hero Sections de altíssimo valor percebido, independentemente do nicho de mercado (energia solar premium, clínicas dermatológicas e longevidade, arquitetura contemporânea, hospitalidade boutique, alta relojoaria, etc.).

---

## 1. Princípios Imutáveis de Design

1. **Fotografia 100% Imersiva (Full Background Cover):**
   - A fotografia deve cobrir 100% da viewport (`inset: 0; object-fit: cover;`).
   - **PROIBIDO:** Dividir a tela 50/50 ("split screen" com texto de um lado e imagem de outro).
   - **PROIBIDO:** Overlays escuros pesados ou radiais que apaguem a nitidez e a luz natural da foto.
   - **MÁSCARA DE LUZ (Scrim):** Usar apenas um gradiente cirúrgico (`backdrop-scrim`) suave na lateral esquerda e na base para garantir legibilidade com `pointer-events: none` e `z-index: 0`.

2. **Espaço Negativo & Lado Direito 100% Limpo:**
   - O lado direito da tela deve ser deixado completamente desobstruído para contemplação da fotografia.
   - **PROIBIDO:** Cards flutuantes artificiais de IA com especificações técnicas simuladas no lado direito.

3. **Tipografia Editorial Contida & Sem Badges Genéricas:**
   - **PROIBIDO:** Empilhar badges/tags clichês acima do título (ex.: tags com ícones genéricos ou pílulas coloridas).
   - **TÍTULO H1:** Escala contida e comedida (`clamp(1.65rem, 1.25rem + 1.3vw, 2.5rem)`), preservando 70%+ da altura da tela livre.
   - **ANCIORAGEM:** Todo o bloco do palco (`.hero-stage`) deve estar estritamente ancorado e alinhado à **esquerda** (`text-align: left; align-items: flex-start;`).

4. **Navegação Flutuante com Revelação no Scroll (Sticky Scroll-Reveal):**
   - Ao abrir o site, a navbar principal fica oculta (`transform: translate(-50%, -130%); opacity: 0; pointer-events: none;`), permitindo impacto fotográfico puro.
   - Ao realizar a primeira rolagem (`scrollY > 30`), a navbar desce suavemente com animação cúbica (`cubic-bezier(0.22, 1, 0.36, 1)`).
   - Formato arredondado em *Pill* (`border-radius: 9999px`) com *glassmorphism* suave (`backdrop-filter: blur(20px) saturate(160%)`).

5. **Botões Táteis de Alto Contraste:**
   - **Primário:** Pílula sólida luminosa (`#ffffff` ou tom claro de contraste máximo) com microinteração de seta interativa (`→`) no hover.
   - **Secundário:** Acabamento em vidro fosco translúcido (`rgba(255, 255, 255, 0.08)`) com micro-seta diagonal (`↗`).

6. **Base Discreta (Métricas em Linha & Scroll Cue):**
   - Linha divisória suave atravessando de ponta a ponta (`width: 100%; max-width: none;`).
   - Métricas minimalistas ancoradas à esquerda separadas por bullets discretos (`·`).
   - Indicador de ação *"Role para explorar"* ancorado à direita com microanimação de seta vertical.

7. **Responsividade de Ponta a Ponta:**
   - **Mobile (360px – 430px):** Botões empilhados em coluna com `width: 100%` e touch target confortável (50px de altura). Métricas em fluxo vertical sem quebra horizontal.
   - **Ultrawide & 4K (1920px – 2560px+):** Container `width: 100%; max-width: none;` mantendo a Top Bar e o Footer de ponta a ponta, enquanto o `.hero-stage` permanece ancorado no terço esquerdo (`max-width: 680px – 1100px`).

---

## 2. Tokens de Design & Paleta de Cores

```css
:root {
  --bg-deep: #080c0a;                /* Fundo escuro profundo */
  --text-pure: #ffffff;              /* Texto principal de alto contraste */
  --text-muted: #b4bdb6;             /* Texto de apoio com legibilidade suave */
  --text-subtle: #828e85;            /* Detalhes e metadados */
  --accent-gold: #cba367;            /* Ouro champagne refinado */
  --glass-bg: rgba(14, 22, 18, 0.42);/* Fundo translúcido */
  --glass-border: rgba(255, 255, 255, 0.16);
  --radius-pill: 9999px;
  --radius-card: 18px;
  --ease-out-cubic: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 3. Demonstrações Aplicadas
* **Demonstração 01:** Energia Solar & Arquitetura Residencial de Alto Padrão ([demos/01-energia-solar/](file:///C:/Users/devpe/OneDrive/Documentos/site-energia-solar2/demos/01-energia-solar))
* **Demonstração 02:** Clínica de Dermatologia & Estética Médica Exclusiva ([demos/02-clinica-estetica/](file:///C:/Users/devpe/OneDrive/Documentos/site-energia-solar2/demos/02-clinica-estetica))
