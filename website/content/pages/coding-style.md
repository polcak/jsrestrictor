Title: Coding style

### General guidelines

- Use **tabulators** for indentation, and avoid spaces/tabs at the end of the line.
- Functions, methods, classes, ifs, cycles etc. have opening braces at the same line.
- Text width preferred less than 80 characters, maximum 100 characters. It is better having readable code than pursuing this limit.
- Always enclose blocks of expressions into brackets.
- Names are lower case and preferably explain the purpose of the variable, class, etc.
- Comment classes, functions, etc. in Doxygen style. Use `make doc` to generate documentation.

### Code examples

Correct code example:

```javascript
/**
 * This is an example function created for the coding style manual.
 *
 * @param abc The number that will be ...
 * @returns  The Answer to the Ultimate Question of Life, The Universe, and Everything.
 */
function example(abc) {
	var counter = 0;
	for (let i = 0; i < 42; i++) {
		counter++;
	}
	return counter;
};
```

Bad code example:

```javascript
function example(abc)
{
    function method()
    {
      return 42;
	  }
  	return method();
};
```

### Version control workflow

- Do not provide commits dealing with bad coding style. The only exception is if
  you want to improve code that does not follow the coding style rules.
  Preferably provide one commit that fixes the issues and another (others) that
  improve the code, add new functionality etc.
- Atomic commits are useful, see [this
  page](https://www.freshconsulting.com/atomic-commits/) for help.
- A commit should not contain adding missing semicolons, changes in generated
  code, a bugfix, and addition of a new functionality. Each of these changes
  should go to a separate commit with a message explaining why is the change
  necessary (if it is not obvious like in the case of missing semicolons).
- Provide meaningful commit messages. For help, see points 1, 2 and 7 of [this
  guide](https://chris.beams.io/posts/git-commit/)
- Do not fear changing commits that are not public, yet. If you create a bug and
  find it before merge, it is better to fix the bug in the original commit.
  Available Git operations for this are `rebase (-i)`, `fixup`, `squash` and
  `push --force`.
- This pull request (FIXME: need to find link) contains an example of big commits that needed to be refactored.
- Provide merge request more often rather than commiting big changes. If you fix
  Makefile or other scripts, provide the change and do not wait. Create code
  that is understandable and does not repeat itself. If possible, use variables
  instead of copying the same code.
