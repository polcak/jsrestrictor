Title: We received support from NGI0 PET Fund
Date: 2021-03-30 09:00
Series: JShelter background

We are very happy to announce that the <a href="https://nlnet.nl/project/JSRestrictor/">JavaScript
Restrictor received support from NGI0 PET Fund</a>, a fund established by NLnet with financial
support from the European Commission's Next Generation Internet programme, under the aegis of DG
Communications Networks, Content and Technology under grant agreement No 825310.

We are very excited to improve the extension further. We will focus on the following main goals:

### 1. Investigate fingerprinting scripts and prepare wrappers

Review the previously identified APIs suitable for fingerprinting. Select APIs suitable for JShelter and
add wrappers for these APIs. This work has already started, see issue #66. Additionally, we want to focus
on identification of methods used for fingeprinting such as those identified by Iqbal et al., see
https://uiowa-irl.github.io/FP-Inspector/

### 2. Prevent unique identification of a device

It is hard, if not impossible, to both prevent fingerprinting and still provide customized environment
for the user. Hence, we want to identify fingerprinting attempts by counting the number of different
APIs employed by a page, especially APIs that are not frequently used for benign purposes. When
a fingerprinting attempt is identified, we want to (1) inform the user, (2) prevent uploading of the
fingerprint to the server, (3) prevent storing the fingerprint for later usage.

### 3. Code ported from Chrome Zero

In version 0.3, we integrated features of Chrome Zero 7 as it is no longer maintained. By
integrating the functionality to JShelter, we want to keep the counter-meassures available in a
maintained extension. However, we do not have sufficient tests for the functionality.

### 4. Evaluation and porting of code from Brave

Brave browser currently implements anti-fingerprinting techniques that aim at providing little lies
about the browser environment. We want to evaluate the messures and select techniques that are
suitable for JShelter.

### 5. Fixing known bugs

We want to focus on the proposed changes and found bugs that are reported in the GitHub bug tracker.

* We already closed issues #53, #62, and #72 as a part of this project. The fixes are already available as
	a part of the 0.4 subversions.
* We want to also deal with issues #56 and #71 that are crucial for the success of the extension.
* We will focus on other identified bugs in the wrappers or developped techniques.

### 6. Cooperation with the Privacy Shield project

We are also excited to announce that we found other partners that are willing to work on our code
base through the NGI0 PET Fund, <a href="https://nlnet.nl/project/JavascriptShield/">Privacy Shield
project run by Free Software Foundation</a>. Expect inclusion of code that will help to defend your
freedoms and provide anti-malware protections. This cooperation should also improve the GUI of the
extension and create explenatory web pages explaining the functionality and its risks. It is
possible that the project will be rebranded as a result of the cooperation.
