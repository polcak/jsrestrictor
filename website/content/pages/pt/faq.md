Title: Perguntas Frequentes 

[TOC]

### Informação do projeto

#### Como posso ser ativo e participar?

Começa a usar o JShelter e diz aos teus amigos. Podes registar um problema no
nosso [bug tracker](https://pagure.io/JShelter/webextension/issues)
([alternativa](https://github.com/polcak/jsrestrictor/issues)) ou escolher um
dos que lá estão para começar a trabalhar no JShelter. Podes seguir o nosso
progresso no [repositório](https://pagure.io/JShelter/webextension)
([alternativa](https://github.com/polcak/jsrestrictor)). Por favor entra em
contacto connosco antes de começares a implementar, idealmente comentando no
problema que escolheste. Podes-nos contactar por
[e-mail](mailto:jshelter@gnu.org) se quiseres reportar problemas de forma
privada ou se não tiveres uma conta forge. Junta-te à [mailing
list](https://lists.nongnu.org/archive/html/js-shield/) para estar a par das
novidades e participar nas conversas.

#### Posso traduzir a extensão para uma língua nova?

Sim. Vê as [instruções](/i18n/), vai ao
[Weblate](https://hosted.weblate.org/projects/jshelter/) ou traduz a extensão
nos ficheiros JSON. Se quiseres começar a tradução numa língua nova entra em
contacto. Por exemplo, podes registar um problema no [issue
tracker](https://pagure.io/JShelter/webextension/issues) ou enviar um
[e-mail](mailto:jshelter@gnu.org). Se tiveres dúvidas sobre como traduzir uma
frase ou não compreenderes o seu significado, regista um
[problema](https://pagure.io/JShelter/webextension/issues) ou envia-nos um
[e-mail](mailto:jshelter@gnu.org).

#### Qual é o estado atual do JShelter? Está terminado ou ainda está em contrução?

O JShelter está pronto para ser usado no browsing quotidiano. Acreditamos que o
estado atual do JShelter cumpre o seu objetivo de te dar controlo sobre o teu
browser e as APIs que disponibiliza para as páginas web.

We believe that the `Recommended` level changes your fingerprint, so typical
fingerprinting scripts will fail to correlate your cross-origin activities and
activities on the same origin during different browser sessions. See the [threat
model](/threatmodel/), the questions in the [browser
fingerprinting
section](#browser-fingerprinting), and [the section on interaction with other
tools](#interactions-between-jshelter-and-other-similar-tools) for possible
caveats.

Testa o teu browser nos avaliadores de recolha de impressão digital mais comuns.
Depois ativa o nível `Strict` e volta a testar para veres como reduz
consideravelmente a informação sobre o teu computador:

* [EFF Apaga o teu rasto](https://coveryourtracks.eff.org/)
* [Sou único?](https://amiunique.org/)
* [Audio and font fingerprinting](https://audiofingerprint.openwpm.com/)
* [Device info](https://www.deviceinfo.me/)
* [Bromite](https://www.bromite.org/detect)
* [Browser leaks](https://browserleaks.com/)
* [Página de teste do
JShelter](https://polcak.github.io/jsrestrictor/test/test.html)

At the same time, we are aware of several JShelter [bugs and
issues](https://pagure.io/JShelter/webextension/issues/). We are working on
making JShelter bug-free. We do not want to break benign pages. Fixing some
issues takes time. Other issues need balancing between several options. JShelter
is meant to be used with (ad)blockers like [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin). Using a blocker will
make your online activities considerably safer. At the same time, it will make
JShelter break fewer sites.

Neste momento o JShelter precisa de mais atenção tua do que o que gostaríamos.
Algumas das proteções precisam de melhoramentos e há funcionalidades que faltam
incluir. Quando atingirmos o estado em que que resolvemos os bugs e tornamos o
JShelter fácil de gerir vamos lançar a versão 1.0. Se não conseguires lidar com
os ajustes ocasionais que o JShelter requer, considera usá-lo quando lançarmos a
versão 1.0. Se preferires, podes experimentar [outras
ferramentas](/fingerprinting/).

#### Qual é a melhor fonte de informação sobre o JShelter?

As melhores fontes de informação sobre o JShelter estão listadas no [nosso
website](https://jshelter.org/) e no [nosso
paper](https://arxiv.org/abs/2204.01392).

#### O que é o modelo de ameças?

Criamos uma [página dedicada para descrever o modelo de ameaças](/threatmodel/)
do JShelter. Lê a página antes de instalar a extensão. Desta forma podes ter a
certeza que o JShelter está de acordo com as ameaças que encontras online.

### O JShelter estragou uma página. O que posso fazer?

Isto acontece de vez em quando. É algo que queremos elimar mas o [JShelter ainda
não está
terminado](#what-is-the-current-jshelter-status-is-it-ready-or-is-it-still-a-work-in-progress).

Your page might be broken because [Network Boundary Shield](/nbs/) (NBS) or
[fingerprint
Detector](/fpd/) (FPD) detected a problem. You should have seen a notification
in such cases unless you turned notifications off. We do not recommend turning
notifications off (see [the questions on
notifications](#why-do-i-see-so-many-notifications-from-jshelter)). Whenever NBS
or FPD detect a possible problem on the site, it is up to you to decide if you
believe the owner of the visited page or are tempted to view the content so much
that you turn the protection off.

##### Detetor de Impressão Digital (DID)

Se vires uma notificação como:

![Notificação do Detetor de Impressão
Digital]({attach}/images/fpdetection/notifications.png)

Neste caso, o DID avaliou a página que te está a tentar identificar.
Opcionalmente, o DID pode ser configurado para bloquear o upload da impressão
para o servidor. Nesse caso, o DID vai bloquear todos os pedidos da página
visitada e remover os armazenamentos disponíveis para a página. Algumas páginas
usam deteção de impressão digital por motivos de segurança. Nestes casos podes
querer permitir que a página detete a tua impressão digital. Na notificação,
carrega no ícone do JSHelter para abrir o popup que te permite desligar o DID
nesse site.

![Desligar o DID](/images/faq/fpd_off.png)

A definição representada vai desligar o DID em todas as páginas da origem
visitada. Se quiseres desligar o DID para todas as páginas, independentemente da
origem, muda as `definições gerais`.

##### Barreira de Proteção de Rede (BPR)

Se vires uma notificação como:

![JShelter bloqueia a verificação]({attach}/images/portscan-2_request_blocked.png)

Então, foi o BPR que bloqueou alguns pedidos. Raramente as páginas podem ficar
estragadas porque requerem uma interação entre a internet pública e a rede
local. Por exemplo, a Barreira de Proteção de Rede pode estragar alguns sistemas
de intranet. Utilizadorees do JShelter também reportaram um maior de falsos
positivos quando usam programas de filtragem baseados no DNS. Se usas algum,
garante que o DNS revolver 0.0.0.0 para os domínios bloqueados.

![Desligar o BPR](/images/faq/nbs_off.png)

A definição da imagem vai desligar o BPR para todas as páginas da origem
visitada. Se quiseres desligar o BPR para todas as páginas muda as
`Definições gerais`.

##### Escudo Javascript (EJS)

Se não viste nenhuma notificação (e não desligaste as notificações manualmente),
é o Escudo Javascript (EJS) que pode ter estragado a página. Vê as perguntas
sobre [vídeos
estragados](#how-can-i-fix-videos-if-they-fail-to-play-or-retrieve-data-in-time)
e [web
workers](#i-want-to-use-a-website-that-uses-web-workers-but-it-is-broken-how-can-i-fix-the-site)
para ajustes do EJS que possam resolver o teu problema.

Noutros casos, dependendo da tua coragem, experimenta:

###### Desligar o EJS neste domínio

Podes desativar o EJS para todas as páginas visitadas neste domínio, desligando o
EJS:

![Desligar o EJS](/images/faq/jss_off.png)

###### Desligar o EJS neste domínio

Utilizadores experientes podem mudar o nível do EJS:

1. Falsificar resultados da chamada da API ocupa alguns recursos. Se vires que a
página não está a tentar recolher a tua impressão digital, podes querer
desativar toda a proteção contra esta recolha.
1. Carrega no botão `Modificar`, próximo do texto Escudo JavaScript.
1. Seleciona `Desligar o nível de proteção de recolha de impressões digitais`.
Isto vai manter ativos os [embrulhos](#what-is-a-wrapper) relacionados com
segurança, mas toda a proteção de recolha de impressões digitais estará
desativada.

![Desligar proteção de recolha de impressões digitais do
EJS](/images/faq/jss_low.png)

Podes criar níveis de proteção EJS teus na página de `Definições gerais`.

###### Afinar o EJS para este domínio

Por vezes vais querer afinar o EJS. Por exemplo, normalmente não precisas do
áudio embora, por vezes, tenhas de fazer uma chamada online. Outro exemplo,
habitualmente não queres revelar a tua localização mas precisas de usar uma
página com um mapa para te orientares. Ocasionalmente, o EJS pode modificar uma
API de uma forma que a página fica estragada. Nesse caso, podes precisar de
afinar o nível de proteção.

1. Carrega no botão `Modificar`, próximo do texto Escudo JavaScript.
1. Carrega no botão `Afinações pormenorizadas do Escudo JS neste site`.

![Vai a afinações ao modo do EJS](/images/faq/jss_tweak_start.png)

A secção do EJS vai expandir. Os grupos de proteção aplicados estão ordenados
pelo número de chamadas à API em cada grupo. Tipicamente, vais querer afinar as
definições de um dos grupos com mais chamadas. Vê a coluna destacada:

![Afinar o modo EJS](/images/faq/jss_tweak_sorting.png)

1. Antes de afinares qualquer um dos grupos de embrulho, vê a descrição.
1. Afinar a proteção de acordo com as tuas necessidades.

![Afinar o modo EJS](/images/faq/jss_tweaking.png)

#### Como posso consertar vídeos se falharem a reproduzir ou a recuperar dados a tempo?

O JShelter re-implementa mais de 100 APIs JavaScript. Contudo, as páginas podem
usar vários métodos para aceder à mesma API. Infelizmente, os navegadores não
permitem remendar todas as possibilidades, de forma consistente, numa única
chamada. Os Web Workers são uma das possibilidades para aceder às APIs (ver
outras [ameaças](#what-are-web-workers-and-what-are-the-threats-that-i-face)). O
nosso objetivo final é remendar APIs de forma consistente. No entanto, remendar
Web Workers é complicado e ainda não encontramos forma de remendar Workers de
forma contínua. O nosso objetivo final é substituir os Workers com código
síncrono. Porém, até agora, só oferecemos medidas que desativam os Workers ou
que os tornam inoperacionais.

Estamos a [trabalhar](https://pagure.io/JShelter/webextension/issue/43) em
[melhoramentos](https://pagure.io/JShelter/webextension/issue/80). Atualmente,
remendamos Web Workers no nível `Recomendado`(política de`Eliminação`). Todavia,
este método interfere no bom funcionamento dos Web Workers e eles deixam de
poder ser usados para fins benignos. A página também deixa de poder detetar
estragos para limitar a identificação da impressão digital dos navegadores.

Utilizadores do JShelter indicaram que os servidores de streaming de vídeo são
frequentamente afetados. Encontramos páginas que detetam se o navegador tem
suporte de Web Workers e fornecem polyfills quando detetam que não há suporte. A
opção de `Apagar` Web Workers é ideal para estes servidores. A página pode
facilmente detetar a falta de suporte dos Web Workers. Imagina que a página
oferece alternativas como os polyfills. As alternativas não tem a mesma
capacidade dos Web Workers, neste caso podes fazer com que a página funcione em
troca de uma maior facilidade na deteção da tua impressão digital. Usa o DID
para avaliar esta ameaça.

Se confias que o operador do servidor e os seus associados não farão mau uso dos
Web Workers para aceder as APIs originais e [outras
fontes](#what-are-web-workers-and-what-are-the-threats-that-i-face), ou se não
te imporares, muda a opção dos `Web Workers` de `Apagar`para `Baixo`(em Chrome)
ou desactiva-a completamente ([em
Firefox](https://pagure.io/JShelter/webextension/issue/80)). Vídeos e outras
funcionalidades que requerem Web Workers deverão funcionar. Para mudar a opção
segue estes passos:

1. Navega até à página com o vídeo que queres ver.
1. Carrega no ícone do JShelter (normalmente está na barra de ferramentas, junto
à barra de navegação; se não conseguires localizar o ícones vê [esta
pergunta](#can-i-see-a-jshelter-badge-icon-next-to-my-navigation-bar-i-want-to-interact-with-the-extension-easily-and-avoid-going-through-settings)).
1. Carrega no botão de `Modificar`.
1. Carregar no botão `Afinações pormenorizadas do Escudo JS neste site`.
1. Carrega e arrasta o slider dos `Web Workers` para a esquerda até veres que o
valor `Apagar` é substituído por `Baixo` (em browsers baseados no Chromium)
ou `Desprotegido`(Firefox).
1. Carregar no botão `Atualizar página`, no topo.
1. Vê o vídeo.

#### Quero usar um website que usa Web Workers mas que não está a funcionar. Como
posso corrigir o problema?

Primeiro, vê a explicação sobre [Web
Workers](#what-are-web-workers-and-what-are-the-threats-that-i-face).

Lê a [resposta à pergunta sobre
vídeo](#how-can-i-fix-videos-if-they-fail-to-play-or-retrieve-data-in-time).

Se encontrares um website que precisa de ter a proteção contra Web Workers em
nível `Restrito`e não funciona com `Apagar`ou vice-versa, avisa-nos disso
através do [issue tracker](https://pagure.io/JShelter/webextension/issues) ou
por [e-mail](mailto:jshelter@gnu.org).

### Problemas do interface de utilizador

#### Consigo ver um ícone do JShelter perto da minha barra de navegação? Quero
interagir com a extensão e evitar editar as definições.

O JShelter tem um ícone na barra de ferramentas que te permite abrir uma janela
popup. Contudo os browsers tem tendência a esconder o ícone. Se não conseguires
ver o ícone do JShelter à direita da barra onde escrever URLs experimenta:

1. Carregar no ícone das extensões (normalmente é um desenho de uma peça de
puzzle).
1. Afixa o JShelter na barra de ferramentas.

A imagem abaixo mostra como executar estes dois passos em Firefox e browsers
baseados no Chromium.

![Afixa o JShelter na barra de ferramentas do
Firefox]({attach}/images/faq/firefox_pintoolbar.png) ![Afixa o JShelter na barra
de ferramentas em browsers baseado no
Chromium]({attach}/images/faq/chromium_pintoolbar.png)

#### O site abrir uma janela popup. Quero mudar as definições para essa janela mas não
vejo o ícone do JShelter lá. Como como afinar as definições do JShelter nesta
situação?

Se estiveres a usar Firefox:

1. Abre a página `about:config`, carrega na opção `Aceitar o Risco e Continuar`,
1. altera a opção `browser.link.open_newwindow` para `3`,
1. altera a opção `browser.link.open_newwindow.restriction` para `0`.

Estas definições vão obrigar as janelas popup a abrir como tabs novas e, assim,
torna-se mais simples configurar as definições do JShelter em qualquer páginas.

#### Porque é que vejo tantas notificações do JShelter?

De forma geral, devias ver apenas algumas notificações do JShelter. Por omissão,
as definições estão configuradas para dar ao utilizador informação vital sobre o
comportamento do JShelter e as suas alterações à capacidade da página para
efetuar pedidos de rede que frequentemente estragam o funcionamento da página.

Sugerimos instalar um bloqueador de anúncios como o uBlock Origin. O bloqueador
vai conter as ameças mais comuns à segurança e privacidade.

Vê também [a pergunta sobre notificações da
BPR](#i-am-seeing-too-many-nbs-notifications).

##### Estou a ver demasiadas notificações da BPR

A BPR protege de ataques que acontecem muito raramente. O utilizadores do
JShelter queixam-se frequentemente de ver demasiadas notificações quando usam
formas de bloqueio baseadas no DNS. Os mecanismo de utrapassar o bloqueio via
DNS pre-definem um endereço de IP falso, normalmente `0.0.0.0` ou `127.0.0.1`
(IPv4) e `::` ou `::1` (IPv6). Se o teu mecanismo de utrapassar o bloqueio via
DNS devolve `127.0.0.1` e `::1` por favor configura-o para devolver `0.0.0.0` ou
`::`.

1. Dependendo do teu sistema operativo vais usar poucos recursos. Por exemplo, as
máquinas que correm Windows não criam um stream PCT quando um website se liga
a `0.0.0.0` ou `::`, pelo contrário criam um stream PCT quando um website se
liga a quando se ligam a `127.0.0.1` e `::1`. Assim uma página web remota pode
aceder a um wervidor web se estiver a correr localmente na máquina. Nota que a
maioria dos servidores Linux tentam estabelecer uma ligação à porta do localhost
em todos estes endereços.
1. Se o teu mecanismo de filtragem de DNS devolve `0.0.0.0` ou `::`, vai passar
ao JShelter um relatório de intenções. Se devolver `127.0.0.1` ou `::1`, o
JShelter não tem forma de diferenciar o bloqueio de DNS e um ataque como o que
está detalhado no [blog](/localportscanning/).

### Detetor de impressões digitais no browser

#### Qual é a abordagem das pequenas mentiras para proteção contra identificadores de
impressões digitais?

Por favor consulta [este artigo do blog](/farbling/).

#### Qual é a diferença entre as abordagens das pequenas mentiras e mentiras brancas
na proteção contra identificadores de impressões digitais e farbling?

Nenhuma. Ambas se referem à mesma técnica [que está explicada em detalhe nesta
pergunta](#what-is-the-little-lies-approach-to-protect-from-fingerprinters).

#### Que configuração de JShelter devia escolher?

Primeiro, lê [este artigo do blog](/fingerprinting/). Consulta outros [artigos do
blog](/blog/) e outras perguntas nesta secção.

1. Se quiseres ter a mesma impressão digital que muitos outros utilizadores
sugerimos usar o browser Tor (não instales o JShelter no Tor).
1. Se quiseres que seja difícil cruzar a tua impressão digital entre sites
diferentes opta pelo nível `Recomendado`, no JShelter. Se quiseres melhor
proteção de dados sacrificando a identificação da impressão digital entre sites
diferentes, opta pelo nível `Restrito`.
1. Mantém a BPR ligada.
1. Se quiseres detetar e evitar tentativas de identificação da impressão digital
usa DID.

#### Tenho uma impressão digital única? Algumas das propriedades protegidas pelo
JShelter devolvem valores aleatórios.

Primeiro, consulta o nosso [artigo do blog](/fingerprinting/).

No nível `Recomendado`o JShelter modifica de facto algumas propriedades como
sequências de WebGL (`renderer`, `vendor`) para sequências aleatórias. Mas o
JShelter não modifica identificadores aleatórios de microfones e câmaras. Todas
estas propriedades contêm sequências aleatórias que identificam de forma única a
tua sessão no browser.

O JShelter passa mentiras diferentes em domínios diferentes, assim torna-se
difícil o cruzamento entre domínios. Ainda assim convém lembrar que um único
domínio pode ligar todas as tuas atividades durante uma sessão no browser. Se
não quiseres que o JShelter gere sequências aleatórias usa o nível de proteção
`Restrito`(mas vê [outras perguntas nesta secção](#browser-fingerprinting)).

Estamos a [considerar](https://pagure.io/JShelter/webextension/issue/68) uma
forma de controlar melhor o método das pequenas mentiras.

Também estamos a [considerar](https://pagure.io/JShelter/webextension/issue/69)
substituir as sequências aleatórias da API da Web GL com sequências reais.
Contudo falta-nos esta base de dados. Ao mesmo tempo, preocupa-nos a introdução
de inconsistências se aplicar combinações inválidas de sequências reais. Como
criar uma base de dados de sequências reais tomaria muito tempo e, mesmo assim,
um identificador de impressões digitais poderia reconhecer inconsistências,
decidimos não trabalhar ativamente neste issue.

#### A identificação das impressões digitais no browser é uma ameaça real?

More than 100 advertisement companies reveal in the [adtech transparency a
consent
framework](https://www.fit.vutbr.cz/~polcak/tcf/tcf2.html) that they actually
actively scan device characteristics for identification: devices can be
identified based on a scan of the device's unique combination of
characteristics. Vendors can create an identifier using data collected via
actively scanning a device for specific characteristics, e.g., installed fonts
or screen resolution, use such an identifier to re-identify a device.

![Participantes na MTC a fazer identificação atica de aparelhos para criar
impressões digitais](https://www.fit.vutbr.cz/~polcak/tcf/graphs/v2sf2.svg)

Consulta os papers [Browser Fingerprinting: A
survey](https://arxiv.org/pdf/1905.01051.pdf), [Fingerprinting the
Fingerprinters](https://uiowa-irl.github.io/FP-Inspector/) ou [The Elephant in
the Background](https://fpmon.github.io/fingerprinting-monitor/files/FPMON.pdf).

#### O DID recolhe uma lista de páginas/origens que identificaram a minha impressão
digital?

Não, o DID não recolhe qualquer informação. Cada página carregada inicia uma nova
deteção que não está dependente de interações anteriores entre o browser e o
site.

#### Quando o DID deteta que uma origem me está a tentar identificar a minha impressão
difital, isso significa que vai ativar uma proteção mais forte, por exemplo
mudar o EJS para o nível `Restrito` ou aplicar o bloqueio de pedidos HTTP
iniciados pelo domínio?

Não.

Em primeiro, o nível `Restrito` do EJS não corresponde a uma proteção mais forte
da impressão digital. Na verdade, o que faz é tornar a impressão digital
existente estável. Não recomendamos usar o nível `Restrito` como proteção
anti-impressão digital.

Em segundo, a impressão digital é bastante comum em páginas de login. Se uma
página guarda a tua impressão isso não significa que todas irão fazer o mesmo.

Em terceiro, o script de deteção da impressáo digital pode ser carregado na
página de forma irregular. Queremos evitar o bloqueio de um site quando não é
detetada esta recolha.

Se quiseres mudar para um nível diferente, num website, podes fazê-lo
manualmente. Contudo, não recomendamos esta prática.

#### O meu banco (ou outro site de confiança) está a recolher a minha impressão
digital durante uma tentativa de login. Deveria estar preocupado?

A recolha da impressão digital no browser faz parte da autenticação multi-fator
(MFA ou 2FA). O fornecedor tenta proteger a tua conta. Não deves ficar
preocupada, no entanto podes ser forçada a desligar o DID nesse site. Contudo,
sugerimos que não desligues o Escudo Javascript e as suas proteções contra a
deteção da impressão digital.

Do ponto de vista europeu, o [Grupo de Trabalho 29
clarificou](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2014/wp224_en.pdf)
(use case 7.5) que a garantia de segurança do utilizador pode ser vista como
absolutamente necessária para fornecer um serviço online. Assim, parece provável
que a recolha das impressões digitais no browser, por motivos de segurança, seja
considerada uma exceção da privacidade e por isso não seja necessário o
consentimento do utilizador. De acordo com as circunstâncias, a impressão
digital pode ser considerada um dado pessoal. O RGPD também se pode aplicar
aqui. O RGPD enumera a segurança como um possível interesse legítimo de um
responsável pelo tratamento de dados, ver recital 49. No entanto, saber se toda
a deteção de impressões digitais é pertinente é uma questão em aberto.

Compreendemos que nem todas as nossas utlizadoras queiram fornecer informação
sobre os seus aparelhos. Por conseguinte sugeriumos ter o Escudo Javascript
ativo em sites com deteção de impressão digital. Fica ao teu critério se queres
fornecer o mínimo de informação necessária (nível `Restrito`), se queres ter uma
impressão digital diferente em cada visita (nível `Recomendado`, não esqueças
que estás a fornecer os teus dados de login e por isso as tuas ações são
passíveis de identificação), ou se queres criar o teu próprio nível.

#### O JShelter protege contra a deteção de impressão digital a partir da análise das
fontes instaladas?

Não. Neste momento não temos um método fiável para falsificar as fontes
instaladas. Se estás preocupada com a análise das fontes instaladas podes [o
issue](https://pagure.io/JShelter/webextension/issue/60) do JShelter sobre este
tema.

Se estás a usar Firefox e queres ter as tuas fontes ocultas de forma consistente,
liga a opção resistFingerprinting. No entanto considera a [interação entre o
JShelter e a opção
resistFingerprinting](#i-am-using-firefox-fingerprinting-protection-resistfingerprinting-should-i-continue-should-i-turn-firefox-fingerprinting-protection-on).

#### O JShelter protege integralmente a deteção de impressão digital no browser?

Não. Vê o [modelo de ameça](/threatmodel/). Tal como lá está explicado, o
JShelter cria proteções suficientes mas:

1. Não existe um limite definido entre a deteção da impressão digital e as
intenções benignas.
1. Um detetor de impressões digitais pode usar ataques direcionados. Enquanto nós
tentamos usar contra-medidas suficientes e indetetáveis é de esperar que um
atacante, focado e motivado, será capaz de detetar utilizadores do JShelter.
1. Esperamos que os utlizadores usem o DID e o EJS em paralelo. Como ambos
protegem contra a deteção da impressão digital de forma diferente,
complementam-se.

Lê também [as outras perguntas na secção sobre deteção de impressão digital no
browser](#browser-fingerprinting).

### Outras proteções do JShelter

#### O que são Web Workers, e quais são as ameaças que colocam?

De forma resumida, os Web Workers são uma ameaça para os utilizadores do JShelter
por dois motivos:

1. Permitem o acesso a algumas das APIs modificadas. Não há uma forma simples que
o JShelter possa usar para aplicar modificações aos Web Workers. Por isso, se
não usares proteção contra Web Workers arriscas a que os Web Workers possam
anular outras proteções.
1. Aumentam as capacidades dos atacantes. Por exemplo, agentes maliciosos podem
instalar proxies de longa duração no browser.

For more details, see [Web Worker
documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers),
the [explanation of using Web Workers as Man-In-The-Middle
proxy](https://betterprogramming.pub/man-in-the-middle-attacks-via-javascript-service-workers-52647ac929a2),
papers like [Assessing the threat of web worker distributed
attacks](https://www.researchgate.net/publication/313953354_Assessing_the_threat_of_web_worker_distributed_attacks),
and other
[works](http://www.diva-portal.se/smash/get/diva2:1218197/FULLTEXT01.pdf).

#### O que é a Barreira de Proteção de Rede (BPR)?

O teu browser pode receber instruções do criador da página visitada (ou de
agentes maliciosos que conseguiram acrescentar o seu código à página) para agir
como um intermediário que cria ligações a outros aparelhos na rede. A BPR deteta
e evita este tipo de ataques. Para mais informação há uma [página
dedicada](/nbs/) e um [artigo no blog](/localportscanning/).

#### O meu aparelho tem muitos sensores. Eles estão acessíveis para as páginas web? O
JShelter protege-me?

Depending on your browser and your settings, web pages can read sensors leading
to various attacks that include revealing hidden information, and
fingerprinting. JShelter [deals with
sensors](/sensorapi/).

#### O JShelter protege-me de ataques que exploram falhas de hardware?

Yes, JShelter modifies all timestamps, which limits the precision of time
measurements. JShelter rounds the timestamps and adds random number of
milliseconds to the rounded value, preserving the monotony of the timestamps.
The modifications also remove the possibility of [detecting clock
skew](https://www.jucs.org/jucs_21_9/clock_skew_based_computer/jucs_21_09_1210_1233_polcak.pdf)
of your device quickly. See [our
paper](#what-is-the-proper-way-to-cite-jshelter-in-a-paper) for more details.

#### O JShelter protege o meu endereço IP?

Não, não é esse o seu propósito. Para esconder o teu endereço de IP tens de usar
uma VPN, o Tor ou outra técnica semelhante.

#### O JShelter subsitui um bloqueador de rastreamento?

No, many extensions specialize in list-based tracking. We consider list-based
tracking out-of-scope of the JShelter mission. You should keep using a tracker
blocker like [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin) in
parallel with JShelter.

#### O JShelter modifica identificadores de cookies, armazenamento web ou outros IDs
de rastreamento?

Não de forma direta. É melhor usar outro tipo de ferramentas para bloquear este
tipo de rastreadores. Por exemplo, o Firefox inclui mecanismos de proteção e
bloqueadores de rastreadores que complementam o JShelter na perfeição.

Contudo, alguns IDs podem ser obtidos com base em scripts de identificação da
impressão digital. Nesse caso, o JShelter vai modificar esses IDs e, de acordo
com as tuas definições, a tua identidade será diferente para cada origem
visitada e em cada sessão.

### Interações entre o JShelter e outras ferramentas semelhantes

#### Que outras extensões recomendam correr em paralelo com o JShelter?

Nós consideramos fundamental usar um bloqueador de rastreadores com o [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin). Vai ajudar a tornar a
navegação mais rápida, limpar as páginas e melhorar a tua privacidade. No
entanto, é fácil contornar os bloqueadores. Os servidores web maliciosos só
precisam de mudar a URL do script. O criadores do JShelter encontraram vários
scripts maliciosos que evitam os bloqueadores de rastreio baseados em listagens.
É por isso que os bloqueadores, apesar de serem uma importante primeira linha de
defesa, não são suficientes porque lhes escapam estes casos em que os scripts
contornam a proteção oferecida.

Extensões web como a [NoScript Security Suite](https://noscript.net/) ou o
[uMatrix](https://github.com/gorhill/uMatrix) permitem às utilizadoras bloquear
JavaScript ou outro tipo de conteúdo, de forma geral ou por domínio. Contudo a
utilizadora tem de avaliar em que domínios deve permitir scripts. O [Arquivo
HTTP denuncia](https://httparchive.org/reports/page-weight?
start=earliest&end=latest&view=list#reqJs) que as páginas incluem, por média (na
data em que este texto foi escrito), 22 pedidos externos (e 21 pedidos em
aparelhos móveis). Muitas páginas estão dependentes do uso de JavaScript para
funcionar. As utilizadores tem de decidir qual o conteúdo que é de confiança,
uma tarefa difícil e que exige muito conhecimento uma vez que a grande maioria
das páginas recorre vários recursos externos a ela. Pior, o código malicioso
pode ser uma parte pequena de um recurso externo e o resto desse recurso pode
ser necessário para que a página funcione corretamente. Extensões como as que
referimos, NoScript Security Suite e uMatrix origin, são boas mas não protegem
completamente a utilizadora de, acidentalmente, permitir código malicioso. O
criador da NoScript Suite faz parte da equipa do JShelter, e o JShelter partilha
uma grande parte do seu código com o NoScript.

We suggest that you use other extensions like [Cookie
AutoDelete](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete),
[Decentraleyes](https://decentraleyes.org),
[ClearURLs](https://docs.clearurls.xyz). All these extensions are important in
making your browser leak as little data as possible, and all these protections
are out-of-scope of JShelter.

É importante saber que [as extensões não conseguem esconder o teu endereço
IP](#does-jshelter-protect-my-ip-address).

#### Já tenho uma extensão para bloqueio de rastreadores. Preciso do JShelter?

As extensões de bloqueio de rastreadores são baseadas numa lista de URLs
maliciosas conhecida. Ou seja, alguém precisou de identificar estas URLs em
primeiro lugar. Algumas URLs maliciosas não estão na lista porque ainda não
foram descobertas. Outras podem estar incluídas numa lista especializada ou
menos conhecida. O JShelter protege-te de certas ameças que não são cobertas por
estas listas.

Algumas páginas de login identificama tua impressão digital quando as estás a
usar. Nestes casos, podes precisar de manter privada a configuração de um
aparelho em particular. O JShelter pode limitar (nível `Restrito`) ou criar
informação falsa (nível `Recomendado`) para contornar os métodos de
identificação da impressão digital, no browser.

#### Estou a usar a proteção contra identificação da impressão digital do Firefox
(resistFingerprinting). Devo continuar a usá-la? Devo ativar esta proteção?

Mozilla is working on integrating fingerprinting resisting techniques [from
Torbrowser](https://bugzilla.mozilla.org/show_bug.cgi?id=1329996) to Firefox
(Firefox Fingerprinting Protection, also known as resist fingerprinting).
However, the work is not done. Firefox Fingerprinting Protection tries to
confuse simple fingerprinters with random data. Sophisticated fingerprinters
will create a [homogeneous fingerprint](/fingerprinting/). It is a research
question if the homogeneous fingerprint strategy makes sense before it is
adopted by all users.

Além disso existem algumas inconsistências. Por exemplo, o browser Tor não
implementa WebGL. Ao adotar proteções contra identificação da impressão digital
do browser Tor, o Firefox modifica as renderizações de canvas em 2D mas não
altera as de canvas WebGL. Isto cria um falso sentimento de proteção. O JShelter
modifica o canvas em 2D e o WebGL de forma consistente.

Proteção contra Identificação da Impressão Digital no Firefox pode ser útil em
casos como o de um portátil comum, com definições predefinidas, que muda
frequentemente de IP. Mas se não te importas de ter a mesma impressão digital,
tal como muitas outras utilizadoras, sugerimos que uses o browser Tor.

Não podes afinar a Proteção contra Identificação da Impressão Digital no Firefox.
É uma opção que pode ser ativada ou não. O JShelter tem opções que te permitem
modificar o seu comportamento por domínio.

#### Devo instalar o JShelter se estiver a usar o browser Brave?

Muitas das proteções do JShelter são provenientes do Brave. Apsar do JShelter ter
proteções adicionais, as mais importantes são comuns ao Brave. Não deves usar o
Escudo JavaScript, se usares deves afinar os níveis para remover duplicados.
Deves usar a Barreira de Proteção de Rede e o Detetor de Impressões Digitais.
Apesar de estarmos atentos às proteções do Brave não temos uma configuração
específica para ele. Se tiveres uma por favor partilha-a connosco.

#### Estou a usar outra proteção anti deteção de impressão digital. Devo continuar?
Faz sentido combinar este tipo de extensões?

Vê o artigo do nosso blog sobre [deteção da impressão digital](/fingerprinting/).
Além disso, deves considerar os seguintes pontos:

EJS modifica a tua impressão digital, enquanto o DID deteta ou evita (se ativo) a
deteção da impressão digital. Se combinares mais formas de modificar a impressão
digital, os resultados não são fáceis de prever. As extensões instaladas podem
estar a modificar os mesmo dados (ou dados similares) ou podem estar a modificar
APIs distintas. Se usas várias estratégias que se focam em diferentes APIs, à
partida será mais difícil identificar a tua impressão digital. Ao mesmo tempo, é
possível que a combinação que as extensões criam seja única e, por isso, fácil
de identificar por um detetor sofisticado.

Vamos pensar num exemplo. Imagina que instalas a extensão A, que altera o
conteúdo do elemento canvas. O JShelter alterar dados durante a renderização do
canvas por isso vai aplicar as suas medidas de proteção depois das medidas
aplicadas pela extensão A. No nível `Restrito`vai alterar todas as modificações
feitas pela extensão A. O método das pequenas mentiras alteraria ligeiramente as
modificações da extensão A, o que é inútil ou mesmo contraproducente.

Agora vamos imaginar outra extensão, chamada B, que altera os dados renderizados.
As duas extensões, JShelter e B, estão a tentar modificar as mesmas APIs e por
isso é provável que se crie uma [condição de
corrida](https://pt.wikipedia.org/wiki/Condi%C3%A7%C3%A3o_de_corrida) em que o
mecanismo mais rápido sairá vencedor. Se este cenário se colocar, e ocorrer a
condição de corrida, podes ser mais facilmente identificado porque o detetor de
impressões digitais vê impressões diferentes. Identificar a impressão verdadeira
vai depender de quão preciso e sofisticado é o detetor.

O JShelter tenta aplicar modificações de forma consistente. Contudo, se a
extensão B altera só uma parte das APIs que o JShelter modificou um detetor de
impressões digitais sofisticado pode usar esta informação para melhorar a sua
eficácia.

Se usares mais métodos similares ao DID é provável que não interajam mal entre
elas.

Podes afinar o JShelter para aplicar apenas algumas proteções como, por exemplo,
criar os teus próprios níveis para o EJS. Também podes usar o nível predefinido
"Desligar proteção da deteção de impressão digital" para manter as
contra-medidas que evitam a recolha da impressão digital. Outra opção seria
desligar o EJS e tirar partido das proteções dadas pelo DID e pela BPR.

O JShelter incluí técnicas sofisticadas através da [Biblioteca Partilhada do
NoScript](https://noscript.net/commons-library)(NSCL) para injetar
[wrappers](#what-is-a-wrapper) da API atempadamente e de forma fiável enquanto
outras extensões podem não estar. Consulta também [a
pergunta](#i-saw-several-extensions-that-claim-that-it-is-not-possible-to-modify-the-javascript-environment-reliably-are-you-aware-of-the-firefox-bug-1267027)
[neste bug de Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027).

A maior parte das outras ferramentas concentram-se em [impressões digitais
homogéneas](/fingerprinting/). Ao usar o JShelter com o EJS no nível
`Recomendado` vais alterar a impressão digital e criar um pequeno grupo, de que
possivelmente só tu fazes parte. Apesar disso alguns os detetores de impressão
digital vão continuar confusos, o que diminui a probabilidade de seres
identificado por estes detetores pouco inteligentes.

Imagina um detetor pouco inteligente que cria um único número com a combinação de
todos os dados que consegue recolher. Como o JShelter modifica as APIs de forma
diferente em cada sessão e para cada domínio não vale a pena instalar mais
nenhuma extensão para modificar a impressão digital.

Agora imagina o oposto, um detetor inteligente que analisa os dados recolhidos
para a impressão digital. É possível que ele detete que usas o JShelter ou algo
semelhante. Ao usares múltiplas extensões, cuja interação é imprevisível, podes
conseguir interferir com a análises que ele faz e, dessa forma, o conseguir
confundi-lo.

Um detetor de impressões digitais ainda mais inteligente pode-se focar nas
características únicas das extensões que usas (e que modificam a página,
incluindo alterações estéticas ou extensões que adicionam botões, como os
gestores de palavras-passe ou transferência de conteúdos). Como o [modelo de
ameaças](/threatmodel/) do JShelter não protege deste tipo de detetores de
impressão digital tens melhores hipóteses de não ser identificado se não
deixares o JShelter alterar a tua impressão digital.

#### Vi várias extensões que afirmam ser impossível modificar o ambiente JavaScript de
forma fiável. Estão a par [deste bug do
Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027)?

Sim, estamos a par dos problemas ligados à fiabilidade da injeção de scripts
antes que os scripts da página possam aceder de forma permanente às chamadas
originais da API. De facto, o próprio JShelter (na altura chamado de JavaScript
Restrictor) [sofreu do mesmo
bug](https://github.com/polcak/jsrestrictor/issues/25) durante algumas versões.
O JShelter integra a [Biblioteca Partilhada do
NoScript](https://noscript.net/commons-library)(no original NoScript Common
Library, abreviada para NSCL), o que permite inserir scripts de forma fiável
antes que os scripts da página se iniciem. Desta forma, podemos garantir que as
APIs estão protegidas. A BPNS disponibiliza uma camada transversal aos vários
browsers com o objetivo de modificar todas as formas de aceder a funções da API,
desde iframes a páginas protegidas por Content Security Policy (Política de
Segurança de Conteúdo, também conhecida como CSP), e mais. Consulta o nosso
[paper](https://arxiv.org/pdf/1905.01051.pdf) para mais detalhes sobre a
integração da NSCL no JShelter.

#### Como é que a BPR interage com proxies? Pode haver uma fuga dos meus pedidos DNS
através da BPR?

Se estás a usar um proxy, os ataques que a BPR tentar impedir passam através do
proxy para a rede local do proxy (atenção que isto pode não se verificar no caso
de configurações mais complexas do JShelter).

Em browsers baseado no Chromium, a BPR funciona da mesma forma que funcionaria
sem o proxy. Nesse caso, a BPR protege a rede local do proxy. Dependendo da
implementação e da configuração, também poderá proteger a tua rede local.

No Firefox, a BPR usa a API DNS que inicia o pedido DNS. Identidades contextuais
permitem que as utilizadoras passem por um proxy em alguns separadores e noutros
não. Nós optamos por não fazer resolução DNS para pedidos proxy na BPR. Vê o <a
href="https://pagure.io/JShelter/webextension/issue/41">issue 41</a> e o <a
href="https://pagure.io/JShelter/webextension/issue/85">issue 85</a> para mais
detalhes. No futuro, podemos voltar a re-implementar a BPR para pedidos com
proxies em Firefox da mesma forma que esta implementada para Chromium. Outra
possibilidade que podemos considerar, no futuro, será acrescentar uma opção que
permita às utilizadoras aderir à resolução DNS na BPR. Isto seria útil para
utilizadoras que usem um proxy HTTP na sua redel local. Se tens bons argumentos
para nos convencer a mudar este funcionamento fala connosco.

### Limitações dos browsers suportados

#### Porque é que o JShelter / Biblioteca Partilhada do NoScript (no original NoScript
Common Library) inicia pedidos web para o ff00::?

Em primeiro, consulta [a pergunta sobre modificações fiáveis ao ambiente
JavaScript]](#i-saw-several-extensions-that-claim-that-it-is-not-possible-to-modify-the-javascript-environment-reliably-are-you-aware-of-the-firefox-bug-1267027).

A NSCL precisa de uma forma síncrona de transferir dados entre os diferentes
scripts da extensão. As APIs das extensões web só permitem comunicação
assíncrona. Mas não há problema porque o pedido é cancelado no
[código](https://github.com/hackademix/nscl/blob/40e765f0d66a10b25a27a375bc62ea141a73734f/common/SyncMessage.js#L106).

Adicionalmente [ff00::]

* é um [endereço IPV6 reservado de difusão
múltipla](https://www.iana.org/assignments/ipv6-multicast-addresses/ipv6-multicast-addresses.xhtml#ipv6-scope),
* e portanto não é um endpoint HTTP válido (se tentares aceder a http://[ff00::]
o browser vai-te sempre dizer que esse recurso é inacessível,
* o [back-end da SyncMessage cancela o
webRequest](https://github.com/hackademix/nscl/blob/40e765f0d66a10b25a27a375bc62ea141a73734f/common/SyncMessage.js#L106).

Algumas ferramentas podem ver este pedido mas ele nunca vai sair do teu browser.

#### A BPR funciona da mesma maneira no Firefox e em browsers baseados no Chromium?

Não. O Firefoz permite que as extensões executem resolução DNS do nome do domínio
ao qual o browser está prester a ir buscar informação. A resolução do nome DNS
para um endereço IP é fundamental para o DID. Como o Firefox permite executar a
resolução antes que qualquer pedido seja enviado pelo browser, o JShelter pode
impedir todas as tentativas de atravessar a barreira da rede.

Os browsers baseados em Chromium não contemplam APIs para resolução de DNS. O
JShelter recolhe os resultados de resolução em cache, durante o processamente de
cada pedido (isto depois do browser fazer o pedido). Isso significa que o
primeiro pedido para cada domínio passa pela rede. A partir daí o JShelter
bloqueia os pedidos consecutivos.

Atenção, é possível que um atacante tente mudar o domínio em cada pedido. Para
fazer isso pode usar, por exemplo, uma sequência assim a.attacker.com,
b.a.attacker.com, c.b.a.attacker.com. Como vês, é relativamente simples
ultrapassar a proteção da BPR. Na prática, sabemos que os atacantes não mudam os
nomes dos domínios (podes ver um exemplo no [nosso blog](/localportscanning/)).
Apesar de não ser a solução ideal mantemos a BPR nos browser baseados em
Chromium.

#### Há suporte de Firefox em Android?

Fizemos testes ao JShelter em Firefox para Android, e vimos que funcionava. De
momento não temos capacidade para manter testes regulares. Se quiseres juntar-te
e seguir o estado do JShelter em Firefox para Android és bem-vinda!

##### Não vejo o JShelter na lista de addons suportador pelo Firefox para Android.

Não porquê mas a Mozilla optou por mostrar [apenas um pequeno número de extensões
selecionadas](https://support.mozilla.org/en-US/kb/find-and-install-add-ons-firefox-android)
na versão mobile do Firefox. A lista tem extensões ótimas como o uBlock Origin,
o NoScript, e o DarkReader, mas o JShelter não foi incluído nesta lista.

Se criares uma [coleção em que inclua o
JShelter](https://www.androidpolice.com/install-add-on-extension-mozilla-firefox-android/)
consegues ultrapassar as limitações atuais.

Alterar a lista de Addons selecionados da Mozilla.org está fora do nosso controlo.

### Outra perguntas

#### O que é um wrapper?

Um wrapper é um pequeno bloco de código a que o JShelter acrescenta às APIs
disponibilizadas pelo browser. Este bloco código lê o valor original e
modifica-o antes que seja passado para responder a um pedido. Os scripts de uma
página não podem ultrapassar os wrappers e ter acesso aos valores originais da
API. Contudo faz sentido consultar também a [pergunta sobre modificações fiáveis
ao ambiente
Javascript](#i-saw-several-extensions-that-claim-that-it-is-not-possible-to-modify-the-javascript-environment-reliably-are-you-aware-of-the-firefox-bug-1267027).

#### Em que consiste um aceleramento da WebAssembly?

Em 2023 melhoramos a performance de algum do código do JShelter. Alguns dos
[wrappers](#what-is-a-wrapper) foram reimplementados em WebAssembly mantendo o
mesmo objetivo que a implementação original, que usa exclusivamente JavaScript.

Os wrappers WebAssembly estão ativos por omissão, podendo falhar excecionalmente
em Chrome, se atacados por um bug que impede o seu funcionamento em algumas
páginas. A nossa sugestão é que mantenhas o wrappers WebAssembly sempre ativos.
No entanto, tens a opção de desativá-los e usar os wrappers baseados
exclusivamente em JavaScript.

#### Sou um programador web, o JShelter pode ajudar-me?

Provavelmente.

Podes usar o [DID e o seu relatório](/fpd/) para aprender quais as APIs que a tua
página está a requisitar. A lista não é compreensiva uma vez que o DID foca
apenas as APIs que são passíveis de usar incorretamente durante a recolha de
impressões digitais.

Podes criar níveis para o EJS que apagam funcionalidades como a geolocalização,
workers, ou o acesso à API de sensores para testar se a tua página é compatível
com os browsers.

#### Sou um DPO (Responsável de Proteção de Dados) ou trabalho numa entidade de
proteção de dados. O JShelter pode ajudar-me?

Sim. Muda as definições do JShelter para o modo passivo:

1. *desligar Escudo JavaScript*,
1. desativa a opção de bloqueio na [BPR](/nbs/) mas mantém as notificações ativas,
1. configura o [DID](/fpd/) para modo passivo, mantém as notificações ativas e,
dependendo do teu caso de estudo, altera o modo de deteção para *default* or
*restrito*.

Compara as informações disponibilizadas nas notificações da BPR e do DID e no
[relatório do DID](/fpd/) com a Política de Privacidade do site que estás a
testar.

[Entra em contacto connosco](mailto:jshelter@gnu.org) se tiveres dúvidas ou
quiseres partilhar a tua experiência.

#### Como posso citar o JShelter num paper?

Usa a seguinte referência: *POLČÁK Libor, SALOŇ Marek, MAONE Giorgio, HRANICKÝ
Radek e McMAHON Michael. JShelter: Give Me My Browser Back. Em: Proceedings of
the 20th International Conference on Security and Cryptography. Rome:
SciTePress - Science and Technology Publications, 2023, pp. 287-294. ISBN
978-989-758-666-8.*

```
@INPROCEEDINGS{JShelter,
   author = "Libor Pol\v{c}\'{a}k and Marek Salo\v{n} and Giorgio Maone and Radek Hranick\'{y} and Michael McMahon",
   title = "JShelter: Give Me My Browser Back",
   pages = "287--294",
   booktitle = "Proceedings of the 20th International Conference on Security and Cryptography",
   year = 2023,
   location = "Rome, IT",
   publisher = "SciTePress - Science and Technology Publications",
   ISBN = "978-989-758-666-8",
   doi = "10.5220/0011965600003555",
   language = "english",
   url = "https://www.fit.vut.cz/research/publication/12716"
}
```

Este paper tem uma versão alargada em [ArXiv
paper](https://arxiv.org/abs/2204.01392). Sempre que possível, incluí na
referência a versão que usaste. Estamos a trabalhar noutras publicações, quando
estiverem terminadas vamos atualizar esta resposta.
