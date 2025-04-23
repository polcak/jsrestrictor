#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = "The JShelter team"
SITENAME = "JShelter"
DESCRIPTION = "Your browser extension to keep you safe"
LONGDESCRIPTION = "An anti-malware Web browser extension to mitigate potential threats from JavaScript, including fingerprinting, tracking, and data collection!"
HOME = "Home"
VIEW_SOURCE_CODE = "View source code"
KEY_PROTECTION = "Key protection"
DEVELOPER_NOTES = "Developer notes"
NOTES_FOR_TRANSLATORS = "Notes for translators"
TRANSLATION_INSTRUCTIONS = "Translation instructions"
TRANSLATION_WEBLATE = "Translate at Weblate"
INSTALL_IN = "Install in"
INSTALL_OTHER = 'Visit the <a href="/install">Install page</a> for other options'
TITLE_ABOUT = 'About'
SECTION_WHAT_TITLE = 'What is JShelter?'
SECTION_WHAT = 'JShelter is a browser extension to give you control over what your browser is doing. A JavaScript-enabled web page can access much of the browser\'s functionality, with little control over this process available to the user: malicious websites can uniquely identify you through fingerprinting and use other tactics for tracking your activity. JShelter improves the privacy and security of your web browsing. For more details, see JShelter <a href="/threatmodel/">threat model</a>.'
SECTION_HOW_TITLE = 'How does it work?'
SECTION_HOW = 'Like a firewall that controls network connections, JShelter controls the APIs provided by the browser, restricting the data that they gather and send out to websites. JShelter adds a safety layer that allows the user to choose if a certain action should be forbidden on a site, or if it should be allowed with restrictions, such as reducing the precision of geolocation to the city area. This layer can also aid as a countermeasure against attacks targeting the browser, operating system or hardware.'
SECTION_GETSTARTED_TITLE = 'How can I get started?'
SECTION_GETSTARTED = ' <p>First, install the extension using the button above or checking the various <a href="/install/">installation options</a>.</p> <p>Afterwards, read our <a href="/faq/">FAQ</a>, the <a href="/permissions/">required permissions</a> and the different protection <a href="/levels/">levels</a>.</p> <p>For more details about what\'s going on under the hood, check out the <a href="/blog/">JShelter blog</a> and <a href="https://arxiv.org/abs/2204.01392">paper</a>.</p>'
SECTION_WHO_TITLE = 'Who\'s behind this project?'
SECTION_WHO = 'See the <a href="/credits/">credits page</a>.'
TITLE_CONTRIBUTE = 'Contribute'
SECTION_BUG_TITLE = 'I found a bug!'
SECTION_BUG = 'If you have any questions or you spotted a bug, the project\'s <a href="https://pagure.io/JShelter/webextension/issues">issue tracker</a> is the place for posting those. We especially appreciate feedback, so feel free to use the issue tracker for chiming in.'
SECTION_HELP_TITLE = 'How can I help?'
SECTION_HELP = 'Using JShelter and reporting any problems you find in our <a href="https://pagure.io/JShelter/webextension/issues">issue tracker</a> is a huge help. If you want to contribute to the project itself, post your ideas on the issue tracker or just go ahead and make a pull request.'
SECTION_LICENSE_TITLE = 'What is the license?'
SECTION_LICENSE = 'JShelter is copylefted software, available under the <a href="/license/">GNU General Public License</a>.'

I18N_SUBSITES = {
    "pt": {
        "DESCRIPTION": "A extensão para navegar em segurança",
        "LONGDESCRIPTION": "Uma extensão anti-malware para o teu navegador web que vai pôr sob controlo ameaças de JavaScript, incluindo a recolha de impressões digitais, rastreamento e recolha de dados",
        "HOME": "Início",
        "VIEW_SOURCE_CODE": "Ver o código-fonte",
        "KEY_PROTECTION": "Proteções",
        "DEVELOPER_NOTES": "Notas de desenvolvimento",
        "NOTES_FOR_TRANSLATORS": "Notas de tradução",
        "TRANSLATION_INSTRUCTIONS": "Instruções de tradução",
        "TRANSLATION_WEBLATE": "Traduzir no Weblate",
        "INSTALL_IN": "Instalar no",
        "INSTALL_OTHER": 'Visita a <a href="/pt/install">página sobre instalação</a> para outras opções',
        "TITLE_ABOUT": 'Acerca',
        "SECTION_WHAT_TITLE": 'O que é o JShelter?',
        "SECTION_WHAT": 'O JShelter é uma extensão de browser que te dá controlo sobre o que o teu browser está a fazer. Qualquer página web que use Javascript (e praticamente todas usam) pode aceder à informação que está guardada no teu browser e não tens uma forma simples de poder controlar o que acontece. Usando esta técnica, websites maliciosos conseguem criar uma impressão digital tua que lhes permite identificar-te e monitorizar a tua actividade online. O JShelter protege-te destas técnicas de identificação ao melhorar a privacidade e segurança do teu browser. Para mais detalhes sobre como funciona consulta o <a href="/pt/threatmodel">modelo de ameaças</a> do JShelter.',
        "SECTION_HOW_TITLE": 'Como funciona?',
        "SECTION_HOW": 'Tal como uma firewall controla as ligações do teu computador à rede, o JShelter controla as APIs do browser, restringindo a informação que elas recolhem e que enviam aos websites. O JShelter acrescenta uma camada de segurança que permite à utilizadora escolher, em cada site, quais acções devem ser proibidas e quais podem ser permitidas segundo certas restrições. Por exemplo, permitir o acesso a uma geolocalização pouco precisa, onde se indica apenas a cidade e não a morada completa. Esta camada de protecção também atua como medida preventiva contra ataques ao browser, sistema operativo ou equipamento.',
        "SECTION_GETSTARTED_TITLE": 'Por onde posso começar?',
        "SECTION_GETSTARTED": "<p>Primeiro instala a extensão. Podes usar o botão que está mais acima ou a <a href=\"/install/\">página de instalação</a>, onde estão listadas todas as opções disponíveis.</p> <p>Depois disso, consulta as <a href=\"/faq/\">Perguntas e Respostas Frequentes</a>, as <a href=\"/pt/permissions\">permissões necessárias</a> e os diferentes <a href=\"/pt/levels\">níveis de proteção</a>.</p> <p>Se quiseres saber mais sobre os desenvolvimentos do JShelter e em que estamos a trabalhar podes ver o <a href=\"/pt/blog\">blog</a> e ler o <a href=\"https://arxiv.org/abs/2204.01392\">paper</a>.</p>",
        "SECTION_WHO_TITLE": 'Quem está por detrás deste projecto?',
        "SECTION_WHO": 'Há uma lista detalhada dos autores envolvidos na <a href="/pt/credits/">página de créditos</a>.',
        "TITLE_CONTRIBUTE": 'Contribui',
        "SECTION_BUG_TITLE": 'Encontrei um bug!',
        "SECTION_BUG": 'Temos um sítio para colocar dúvidas e registar bugs. Encontraste um? Deixa-nos mais detalhes no <a href="https://pagure.io/JShelter/webextension/">issue tracker</a> do JShelter. Sugestões e testemunhos sobre a tua experiência com o JShelter são valiosos, deixa-os no issue tracker também.',
        "SECTION_HELP_TITLE": 'Como posso ajudar?',
        "SECTION_HELP": 'Usar o JShelter e colocar no <a href="https://pagure.io/JShelter/webextension/issues">issue tracker</a> o registo dos problemas que encontrares é uma ajuda enorme. Se quiseres contribuir para o código do projecto publica as tuas ideias no issue tracker ou avança para a implementação e envia-nos um pull request.',
        "SECTION_LICENSE_TITLE": 'Qual é a licença?',
        "SECTION_LICENSE": 'O JShelter é software copyleft, disponível segundo a <a href="/pt/license">Licença Pública Geral GNU.',
    },
    "ru": {
    }
}

