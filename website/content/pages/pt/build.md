Title: Construir de raiz 

### GNU/Linux e Mac OS

1. Ver o repositório do projeto: <https://pagure.io/JShelter/webextension>.
1. Faz download de um branch à tua escolha, por exemplo, como arquivo zip.
1. Descompacta o arquivo zip.
1. Corre o comando `make`.
   * Vais precisar de software como `zip`, `wget`, `bash`, `awk`, `sed`.
   * Atenção, ao correr `make` são ignoradas as chamadas do `console.debug`. Se as
quiseres ter ativas corre antes `make debug`.

1. Importa a extensão para o browser.
   * [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)
      1. Abre a página `about:debugging`.
      1. Clica na opção *This Firefox*
      1. Clica no botão *Load Temporary Add-on*
      1. Seleciona o ficheiro `jshelter_firefox.zip` que foi criado quando correste o
`make`.
   * Browsers baseados em Chromium:
      1. Abre a página `chrome://extensions`.
      1. Enable developper mode.
      1. Click `Load unpacked`.
      1. Import the `jshelter_chrome/` directory created by `make`.

### Windows

1. Install Windows Subsystem for Linux (WSL):
<https://docs.microsoft.com/en-us/windows/wsl/install-win10>.
1. Ver o repositório do projeto: <https://pagure.io/JShelter/webextension>.
1. Faz download de um branch à tua escolha, por exemplo, como arquivo zip.
1. Descompacta o arquivo zip.
1. Open the JShelter project folder in WSL, run `make`.
   * Make sure that `zip` and all other necessary tools are installed.
   * Note that EOL in `fix_manifest.sh` must be set to `LF` (you can use the tool
`dos2unix` in WSL to convert `CR LF` to `LF`).

1. On Windows, import the extension to the browser according to the instructions
for Linux (above).
