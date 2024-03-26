Title: Home
Template: home
save_as: index.html
URL:

<section class="hero block has-text-centered">
    <header>
      <h2 class="logo">
        <img src="/theme/images/jshelter-hero.svg" alt="JShelter logo">
        <span>JShelter</span>
      </h2>
      <p>An anti-malware Web browser extension to mitigate potential
  threats from JavaScript, including fingerprinting, tracking, and data
  collection!</p>
    </header>
    <div>
      <p class="download-buttons">
        <a id="download-firefox" class="button is-medium" href="https://addons.mozilla.org/firefox/addon/javascript-restrictor/">
          <i class="fa fa-firefox" aria-hidden="true"></i> Install in Firefox
        </a>
        <a id="download-chrome" class="button is-medium" href="https://chrome.google.com/webstore/detail/javascript-restrictor/ammoloihpcbognfddfjcljgembpibcmb">
          <i class="fa fa-chrome" aria-hidden="true"></i> Install in Chrome
        </a>
        <a id="download-opera" class="button is-medium" href="https://addons.opera.com/extensions/details/javascript-restrictor/">
          <i class="fa fa-opera" aria-hidden="true"></i> Install in Opera
        </a>
      </p>
      <p class="small">Visit the <a href="/install">Install page</a> for other options</p
    </div>
</section><!-- /.hero -->


<section id="about" class="block">
  <header class="has-text-centered">
    <h3>About</h3>
  </header>
  <div class="grid">
    <article>
      <header>
        <h4>What is JShelter?</h4>
      </header>
      <div>
        <p>JShelter is a browser extension to give you control over what your
        browser is doing. A JavaScript-enabled web page can access much of the
        browser's functionality, with little control over this process available
        to the user: malicious websites can uniquely identify you through
        fingerprinting and use other tactics for tracking your activity.
        JShelter improves the privacy and security of your web
        browsing. For more details, see JShelter <a href="/threatmodel/">threat model</a>.</p>
      </div>
    </article>
    <article>
      <header>
        <h4>How does it work?</h4>
      </header>
      <div>
        <p>Like a firewall that controls network connections, JShelter controls
        the APIs provided by the browser, restricting the data that they gather
        and send out to websites. JShelter adds a safety layer that allows the
        user to choose if a certain action should be forbidden on a site, or if
        it should be allowed with restrictions, such as reducing the precision
        of geolocation to the city area. This layer can also aid as a
        countermeasure against attacks targeting the browser, operating system
        or hardware.</p>
      </div>
    </article>
    <article>
      <header>
        <h4>How can I get started?</h4>
      </header>
      <div>
        <p>First, install the extension using the button above or checking the various <a href="/install/">installation options</a>.</p>
        <p>Afterwards, read our <a href="/faq/">FAQ</a>, the <a href="/permissions/">required permissions</a> and the different protection <a href="/levels/">levels</a>.</p>
        <p>For more details about what's going on under the hood, check out the <a href="/blog/">JShelter blog</a> and <a href="https://arxiv.org/abs/2204.01392">paper</a>.</p>
      </div>
    </article>
    <article>
      <header>
        <h4>Who's behind this project?</h4>
      </header>
      <div>
        <p>See the <a href="/credits/">credits page</a>.</p>
      </div>
    </article>
  </div>
</section>

<section id="contribute" class="block">
  <header class="has-text-centered">
    <h3>Contribute</h3>
  </header>
  <div class="grid">
    <article>
      <header>
        <h4>I found a bug!</h4>
      </header>
      <div>
        <p>If you have any questions or you spotted a bug, the project's <a href="https://pagure.io/JShelter/webextension/issues">issue tracker</a> is the place for posting those. We especially appreciate feedback, so feel free to use the issue tracker for chiming in.</p>

      </div>
    </article>

    <article>
      <header>
        <h4>How can I help?</h4>
      </header>
      <div>
        <p>Using JShelter and reporting any problems you find in our <a href="https://pagure.io/JShelter/webextension/issues">issue tracker</a> is a huge help. If you want to contribute to the project itself, post your ideas on the issue tracker or just go ahead and make a pull request.</p>
      </div>
    </article>

    <article>
      <header>
        <h4>What is the license?</h4>
      </header>
      <div>
        <p>JShelter is copylefted software, available under the <a href="/license/">GNU General Public License</a>.</p>
      </div>
    </article>
  </div>
</section>
