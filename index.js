const columnDiv = document.querySelector('#main-row')
columnDiv.addEventListener('animationend', (event) => {
	spinner.classList.add('d-none')
})

const addressForm = document.querySelector('#address-form')
const myVoteAnchor = document.querySelector('#my-votes-link')
const homeButton = document.querySelector('#home-button')
const spinner = document.querySelector('#spinner')

addressForm.addEventListener('submit', submitForm)

function submitForm(event) {
	event.preventDefault()
	// const addressValue = event.target.inlineFormAddress.value
	const username = event.target.inlineFormInputGroupUsername.value.toLowerCase()
	fetch('http://localhost:3000/users', {
		//eslint-disable-line
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify({
			user: {
				username: username,
			},
		}),
	})
		.then((r) => r.json())
		.then((user) => {
			columnDiv.dataset.userId = user.id
			myVoteAnchor.addEventListener('click', showMyVotesEvent)
			if (user.address === null) {
				updateForm(user)
			} else {
				columnDiv.innerHTML = ''
				fetchRep(user.id, true)
				disableInputArea()
				// add code put username in label and add destory button to user
			}
		})
}

function updateForm(user) {
	addressForm.innerHTML = ''
	// alert('Please enter your address') // eslint-disable-line
	const formRow = createAndAppendElement('div', addressForm, null, 'form-row')
	const smallCol = createAndAppendElement('div', formRow, null, 'col-sm-9 my-1')
	formAddressComponents(smallCol, user, formRow)
}

function formAddressComponents(smallCol, user, formRow) {
	createAndAppendElement('label', smallCol, null, 'sr-only', (element) => {
		element.setAttribute('for', 'inlineFormAddress')
		element.innerText = 'Address'
	})
	createAndAppendElement('input', smallCol, 'inlineFormAddress', 'form-control', (element) => {
		element.dataset.id = user.id
		element.placeholder = 'Address'
	})
	const buttonCol = createAndAppendElement('div', formRow, 'address-submit', 'col-sm-3 my-1')
	createAndAppendElement('button', buttonCol, null, 'btn btn-primary', (element) => {
		element.innerText = 'Add Address'
	})
	addressForm.removeEventListener('submit', submitForm)
	addressForm.addEventListener('submit', updateFormEventListener)
}

function updateFormEventListener(event) {
	event.preventDefault()
	const id = event.target.inlineFormAddress.dataset.id
	const address = event.target.inlineFormAddress.value
	patchAddress(id, address).then((userObj) => {
		columnDiv.innerHTML = ''
		fetchRep(userObj.id, true)
		setupOrigianlFormDisabled(userObj, true)
	})
}

function setupOrigianlFormDisabled(user, isDisabled) {
	addressForm.innerHTML = ''
	const formRow = createAndAppendElement('div', addressForm, null, 'form-row')
	const smallCol = createAndAppendElement('div', formRow, null, 'col-sm-9 my-1')
	formUserComponents(smallCol, user, formRow)
	if (isDisabled) {
		disableInputArea()
	} else {
		window.scrollTo(0, 0)
		addressForm.removeEventListener('submit', removeUser)
		addressForm.addEventListener('submit', submitForm)
	}
}

function formUserComponents(smallCol, user, formRow) {
	createAndAppendElement('label', smallCol, null, 'sr-only', (element) => {
		element.setAttribute('for', 'inlineFormInputGroupUsername')
		element.innerText = 'Username'
	})
	const inputGroup = createAndAppendElement('div', smallCol, null, 'input-group')
	const inputGroupPrepend = createAndAppendElement('div', inputGroup, null, 'input-group-prepend')
	createAndAppendElement('div', inputGroupPrepend, null, 'input-group-text', (el) => {
		el.innerText = '@'
	})
	createAndAppendElement('input', inputGroup, 'inlineFormInputGroupUsername', 'form-control', (element) => {
		if (user !== null) {
			element.value = user.username
			element.disabled = true
		} else {
			element.placeholder = 'Enter Username'
			element.disabled = false
		}
	})
	const buttonCol = createAndAppendElement('div', formRow, 'address-submit', 'col-sm-3 my-1')
	createAndAppendElement('button', buttonCol, 'username-submit', 'btn btn-primary', (element) => {
		element.innerText = 'Submit'
	})
	addressForm.removeEventListener('submit', updateFormEventListener)
	addressForm.addEventListener('submit', submitForm)
}

function disableInputArea() {
	let textInput = document.querySelector('#inlineFormInputGroupUsername')
	let inputButton = document.querySelector('#username-submit')
	if (textInput === null) {
		textInput = document.querySelector('#inlineFormAddress')
	}
	if (inputButton === null) {
		inputButton = document.querySelector('#address-submit')
	}
	textInput.disabled = true
	inputButton.className = 'btn btn-danger'
	inputButton.innerText = 'Delete!'
	addressForm.removeEventListener('submit', submitForm)
	addressForm.addEventListener('submit', removeUser)
}

function removeUser(event) {
	event.preventDefault()
	const id = columnDiv.dataset.userId
	fetch(`http://localhost:3000/users/${id}`, {
		//eslint-disable-line
		method: 'DELETE',
		headers: {
			'content-type': 'application/json',
			Accept: 'application/json',
		},
	})
		.then((response) => response.json())
		.then((success) => {
			console.log('Show inital page!')
			setupOrigianlFormDisabled(null, false)
			while (columnDiv.firstChild) columnDiv.removeChild(columnDiv.firstChild)
		})
}

function showMyVotesEvent(event) {
	event.preventDefault()
	const id = columnDiv.dataset.userId
	fetch(`${event.target.href}/${id}`) //eslint-disable-line
		.then((response) => response.json())
		.then((bills) => {
			while (columnDiv.firstChild) columnDiv.removeChild(columnDiv.firstChild)
			const row = createAndAppendElement('div', columnDiv, null, 'row')
			const col = createAndAppendElement('div', row, 'my-votes-col', 'col-sm-12 d-flex flex-column wrapper')
			for (const bill of bills) {
				appendBillToDom(bill, col)
			}
		})
}

function fetchRep(id, federal) {
	fetch(`http://localhost:3000/users/${id}?federal=${federal}`) //eslint-disable-line
		.then((response) => response.json())
		.then(function (members) {
			spinner.classList.remove('d-none')
			console.log(members)
			while (columnDiv.firstChild) columnDiv.removeChild(columnDiv.firstChild)
			let row = createAndAppendElement('div', columnDiv, null, 'row w-100 mx-auto')
			for (let index = 0; index < members.length; index++) {
				const member = members[index]
				renderMember(member, row)
				if ((index + 1) % 3 === 0) {
					row = createAndAppendElement('div', columnDiv, null, 'row w-100 mx-auto')
				}
			}
			window.scrollTo(0, document.querySelector('.jumbotron').clientHeight)
		})
}

function renderMember(member, row) {
	const card = document.createElement('div')
	card.className = 'col-md-4'

	const cardShadow = createAndAppendElement('div', card, null, 'card mb-4 shadow-sm animated bounceInRight faster')

	const cardBody = createAndAppendElement('div', cardShadow, null, 'card-body')
	createAndAppendElement('img', cardBody, null, 'container', (element) => {
		element.height = 400
		if (member.photoUrl === undefined) {
			element.src = 'https://clinicforspecialchildren.org/wp-content/uploads/2016/08/avatar-placeholder.gif'
		} else {
			element.src = member.photoUrl
		}
	})

	createAndAppendElement('h5', cardBody, null, 'card-office', (el) => {
		el.style = 'white-space: overflow:hidden;'
		el.innerText = member.title
	})
	createAndAppendElement('h6', cardBody, null, 'card-name', (el) => {
		el.innerText = member.name
	})
	const buttonDiv = createAndAppendElement('div', cardBody, null, 'd-flex justify-content-between align-items-center')
	createAndAppendElement('div', buttonDiv, `btn-group-${member.name.replace(/[." "]/g, '-')}`, 'btn-group')
	row.append(card)
	makeButton(member)
	// debugger;
	if (member.proPublica_id !== undefined) {
		card.id = `card-${member.proPublica_id}`
		makeButtonForBills(member)
	}
}

function patchAddress(id, address) {
	return fetch(`http://localhost:3000/users/${id}`, {
		//eslint-disable-line
		method: 'PATCH',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		body: JSON.stringify({
			user: {
				address: address,
			},
		}),
	}).then((response) => response.json())
}

function makeButton(member) {
	const buttonDiv = document.querySelector(`#btn-group-${member.name.replace(/[." "]/g, '-')}`)
	createAndAppendElement('button', buttonDiv, null, 'btn btn-sm btn-outline-secondary', (element) => {
		element.innerText = 'Details'
		element.className = 'btn btn-sm btn-outline-secondary'
		element.setAttribute('data-toggle', 'modal')
		element.setAttribute('data-target', '.bd-example-modal-xl')
		element.dataset.id = member.id
		element.addEventListener('click', () => {
			representativeModalElements(member)
		})
	})
}

function representativeModalElements(member) {
	const modalTitle = document.querySelector('#modal-title')
	modalTitle.innerText = member.name
	const tableBody = document.querySelector('#member-info')
	tableBody.innerHTML = ''
	const tr1 = createAndAppendElement('tr', tableBody, null, null)
	createAndAppendElement('td', tr1, null, null, (el) => {
		if (member.phones === undefined) {
			el.innerText = 'Not Available'
		} else {
			el.innerText = member.phones[0]
		}
	})
	createAndAppendElement('td', tr1, null, null, (el) => {
		if (member.party === undefined) {
			el.innerText = 'Not Available'
		} else {
			el.innerText = member.party
		}
	})
	createAndAppendElement('td', tr1, null, null, (el) => {
		if (member.address === undefined) {
			el.innerText = 'Not Available'
		} else {
			el.innerText = Object.values(member.address[0]).join(' ') || 'Not Available'
		}
	})
	createAndAppendElement('td', tr1, null, null, (el) => {
		if (member.urls === undefined) {
			el.innerText = 'Not Available'
		} else {
			el.innerText = member.urls[0]
		}
	})
	const tr2 = createAndAppendElement('tr', tableBody, null, null)
	const twitterDiv = document.querySelector('#twitter-div')
	// console.log(twitterDiv)
	// createAndAppendElement('a', twitterDiv, null, "twitter-timeline", (el) => {
	//   el.setAttribute('data-width', '500')
	//   el.setAttribute('data-height', '200')
	//   el.setAttribute('data-theme', 'light')
	//   el.setAttribute('href', "https://twitter.com/VP?ref_src=twsrc%5Etfw")
	// })
	let twitterValue
	member.channels.find((elem) => {
		if (elem.type === 'Twitter') {
			return (twitterValue = elem.id)
		}
	})
	console.log(twitterDiv)
	console.log('TWitterValue', twitterValue)
	if (twitterValue) {
		twitterDiv.innerHTML = `<a class="twitter-timeline" data-width="500" data-tweet-limit="3" data-height="200" data-theme="light" href="https://twitter.com/${twitterValue}">Tweets by ${member.name}</a>`
		$('#my-modal').on('shown.bs.modal', function () {
			!(function (d, s, id) {
				var js,
					fjs = d.getElementsByTagName(s)[0],
					p = /^http:/.test(d.location) ? 'http' : 'https'
				// if (!d.getElementById(id)) {
				js = d.createElement(s)
				js.id = id
				js.src = p + '://platform.twitter.com/widgets.js'
				fjs.parentNode.insertBefore(js, fjs)
				// }
			})(document, 'script', 'twitter-wjs')
		})
	} else {
		twitterDiv.innerText = 'Not Available'
	}
}

function makeButtonForBills(member) {
	const buttonDiv = document.querySelector(`#btn-group-${member.name.replace(/[." "]/g, '-')}`)
	createAndAppendElement('button', buttonDiv, null, 'btn btn-sm btn-outline-secondary', (element) => {
		element.innerText = 'Bills'
		element.dataset.proPublica_id = member.proPublica_id
		element.addEventListener('click', wantToSeeActiveBills)
	})
}

function wantToSeeActiveBills(event) {
	const button = event.target
	button.innerText = 'Back'
	const cardLeft = document.querySelector(`#card-${event.target.dataset.proPublica_id}`)
	columnDiv.innerHTML = ''
	const row = createAndAppendElement('div', columnDiv, null, 'row w-100 mx-auto')
	row.append(cardLeft)
	button.removeEventListener('click', wantToSeeActiveBills)
	button.addEventListener('click', wantFederalReps)
	getBillsFor(button).then((bills) => {
		spinner.classList.remove('d-none')
		appendBillsToDOM(bills, row)
		window.scrollTo(0, document.querySelector('.jumbotron').clientHeight)
	})
}

function getBillsFor(button) {
	return fetch(`http://localhost:3000/representatives/${button.dataset.proPublica_id}`) //eslint-disable-line
		.then((response) => response.json())
}

function wantFederalReps(event) {
	const button = event.target
	const userId = columnDiv.dataset.userId
	button.addEventListener('click', wantToSeeActiveBills)
	button.removeEventListener('click', wantFederalReps)
	fetchRep(userId, true)
}

function appendBillsToDOM(bills, row) {
	const col = createAndAppendElement('div', row, null, 'col-sm-8 d-flex flex-column wrapper animated bounceInUp slow')
	// col.addEventListener('animationend', (event) => { spinner.classList.add('d-none') })
	for (const bill of bills) {
		appendBillToDom(bill, col)
	}
}

function appendBillToDom(bill, col) {
	const card = createAndAppendElement('div', col, `card-${bill.bill_id}`, 'card flex-fill mb-4 shadow')
	createCardBody(card, bill)
}

function createCardBody(card, bill) {
	createAndAppendElement('div', card, null, 'card-header', (el) => {
		el.innerText = bill.short_title
	})
	const cardBody = createAndAppendElement('div', card, `card-body-${bill.bill_id}`, 'card-body d-flex flex-column')
	createAndAppendElement('i', cardBody, null, 'text-muted align-self-end', (el) => {
		el.innerText = `Introduced on: ${bill.introduced_date}`
	})
	createAndAppendElement('div', cardBody, null, 'mt-2 mb-4', (el) => {
		el.innerText = bill.title
	})
	insertBillButtons(card, bill, cardBody)
	// cardBody.innerHTML += `
	// <div class="progress">
	//   <div class="progress-bar bg-success" role="progressbar" style="width: 100%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">50%</div>
	//   <div class="progress-bar bg-danger" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">50%</div>
	// </div>`
}

function insertBillButtons(card, bill, cardBody) {
	if (bill.userforBill !== undefined) {
		createAndAppendElement('em', cardBody, null, 'text-muted align-self-end', (el) => {
			el.innerText = bill.userforBill ? 'You support this!' : 'You do not support this bill!'
		})
		addRemoveVote(card, bill)
	} else {
		addAgreeButtons(card, bill)
	}
}

function addAgreeButtons(card, bill) {
	const footer = createAndAppendElement('div', card, `card-footer-${bill.bill_id}`, 'card-footer')
	const footerRow = createAndAppendElement('div', footer, null, 'row w-100')
	const agreeCol = createAndAppendElement('div', footerRow, null, 'col-6')
	agreeButton(agreeCol, bill)
	const disagreeCol = createAndAppendElement('div', footerRow, null, 'col-6')
	disagreeButton(disagreeCol, bill)
}

function agreeButton(agreeCol, bill) {
	createAndAppendElement('div', agreeCol, 'btn-vote-for', 'btn btn-success btn-lg btn-block', (el) => {
		el.innerText = 'Agree'
		el.dataset.vote = 'true'
		el.dataset.billId = bill.bill_id
		el.dataset.sponsorId = bill.sponsor_id
		el.addEventListener('click', voteForBill)
	})
}

function disagreeButton(disagreeCol, bill) {
	createAndAppendElement('div', disagreeCol, 'btn-vote-against', 'btn btn-danger btn-lg btn-block', (el) => {
		el.innerText = 'Disagree'
		el.dataset.vote = 'false'
		el.dataset.billId = bill.bill_id
		el.dataset.sponsorId = bill.sponsor_id
		el.addEventListener('click', voteForBill)
	})
}

function addRemoveVote(card, bill) {
	const footer = createAndAppendElement('div', card, `card-footer-${bill.bill_id}`, 'card-footer')
	const footerRow = createAndAppendElement('div', footer, null, 'row w-100 mx-auto')
	const disagreeCol = createAndAppendElement('div', footerRow, null, 'col-12')
	createAndAppendElement('div', disagreeCol, 'btn-remove-vote', 'btn btn-danger btn-lg btn-block', (el) => {
		el.innerText = 'Remove my vote'
		el.dataset.vote = 'false'
		el.dataset.billId = bill.bill_id
		el.dataset.sponsorId = bill.sponsor_id
		console.log('need to add event lisenter for this!')
		el.addEventListener('click', removeMyVoteEvent)
		// el.addEventListener('click', voteForBill)
	})
}

function removeMyVoteEvent(event) {
	console.log('remove event button pressed.')
	fetch(`http://localhost:3000/bills/voted/${event.target.dataset.billId}`, {
		//eslint-disable-line
		method: 'DELETE',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify({
			user_id: columnDiv.dataset.userId,
		}),
	})
		.then((r) => r.json())
		.then((bill) => {
			console.log('in remove my vote')
			const card = document.querySelector(`#card-${bill.bill_id}`)
			console.log(card.parentElement)
			if (card.parentElement.id === 'my-votes-col') {
				card.remove()
			} else {
				card.innerHTML = ''
				createCardBody(card, bill)
			}
		})
}

function voteForBill(event) {
	const userId = columnDiv.dataset.userId
	voteBillPOST(userId, event).then((bill) => {
		const card = document.querySelector(`#card-${bill.bill_id}`)
		card.innerHTML = ''
		createCardBody(card, bill)
	})
}

function voteBillPOST(userId, event) {
	return fetch(`http://localhost:3000/bills`, {
		//eslint-disable-line
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			representatives_user: {
				user_id: userId,
				representative_id: event.target.dataset.sponsorId,
				bill_id: event.target.dataset.billId,
				vote: event.target.dataset.vote,
			},
		}),
	}).then((response) => response.json())
}

function createAndAppendElement(tag, parent, id, className, callback) {
	const element = document.createElement(tag)
	parent.append(element)
	if (id !== null) element.id = id
	if (className !== null) element.className = className
	if (callback !== undefined) callback(element)
	return element
}

// function addingEventdropDownMenuSelector (callback) {
const local = document.querySelector('#local-items')
const fed = document.querySelector('#federal-items')
// const arr = [local,federal]
local.addEventListener('click', function () {
	fetchRep(columnDiv.dataset.userId, false)
})

fed.addEventListener('click', function () {
	fetchRep(columnDiv.dataset.userId, true)
})

homeButton.addEventListener('click', function () {
	fetchRep(columnDiv.dataset.userId, true)
})
