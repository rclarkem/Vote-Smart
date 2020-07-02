const columnDiv = document.querySelector('#main-row')
const addressForm = document.querySelector('#address-form')
const myVoteAnchor = document.querySelector('#my-votes-link')

addressForm.addEventListener('submit', submitForm)
function submitForm(event) {
	event.preventDefault()
	// const addressValue = event.target.inlineFormAddress.value
	const username = event.target.inlineFormInputGroupUsername.value
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
				// address: addressValue
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
				fetchFederal(user.id)
			}
		})
}

function showMyVotesEvent(event) {
	event.preventDefault()
	const id = columnDiv.dataset.userId
	fetch(`${event.target.href}/${id}`) //eslint-disable-line
		.then((response) => response.json())
		.then((bills) => {
			console.log(bills)
		})
}

function fetchFederal(id) {
	fetch(`http://localhost:3000/users/${id}?federal=true`) //eslint-disable-line
		.then((response) => response.json())
		.then(function (members) {
			console.log(members)
			while (columnDiv.firstChild) columnDiv.removeChild(columnDiv.firstChild)
			let row = createAndAppendElement('div', columnDiv, null, 'row w-100 mx-auto')
			for (let index = 0; index < members.length; index++) {
				const member = members[index]
				renderMemberRob(member, row)
				if ((index + 1) % 3 === 0) {
					row = createAndAppendElement('div', columnDiv, null, 'row w-100 mx-auto')
				}
			}
		})
}

function renderMemberRob(member, row) {
	const card = document.createElement('div')
	card.className = 'col-md-4'
	const cardShadow = createAndAppendElement(
		'div',
		card,
		null,
		'card mb-4 shadow-sm animated bounceInRight fast'
	)
	const cardBody = createAndAppendElement('div', cardShadow, null, 'card-body')
	createAndAppendElement('img', cardBody, null, 'container', (element) => {
		element.src = member.photoUrl
	})
	createAndAppendElement('h4', cardBody, null, 'card-office', (el) => {
		el.innerText = member.title
	})
	createAndAppendElement('h5', cardBody, null, 'card-name', (el) => {
		el.innerText = member.name
	})
	const buttonDiv = createAndAppendElement(
		'div',
		cardBody,
		null,
		'd-flex justify-content-between align-items-center'
	)
	createAndAppendElement('div', buttonDiv, `btn-group-${member.channels[1].id}`, 'btn-group')
	row.append(card)
	makeButton(member)
	socialIcons(buttonDiv, member)
	// addddded this --------------------
	if (member.proPublica_id !== undefined) {
		card.id = `card-${member.proPublica_id}`
		makeButtonForBills(member)
	}
}

function renderMember(member) {
	const card = document.createElement('div')
	card.className = 'col-md-4'

	const cardShadow = createAndAppendElement('div', card, null, 'card mb-4 shadow-sm')
	const cardBody = createAndAppendElement('div', cardShadow, null, 'card-body')
	createAndAppendElement('img', cardBody, null, 'container', (element) => {
		element.src = member.photoUrl
	})
	createAndAppendElement('h4', cardBody, null, 'card-office', (el) => {
		el.innerText = member.title
	})
	createAndAppendElement('h5', cardBody, null, 'card-name', (el) => {
		el.innerText = member.name
	})
	const buttonDiv = createAndAppendElement(
		'div',
		cardBody,
		null,
		'd-flex justify-content-between align-items-center'
	)
	createAndAppendElement('div', buttonDiv, `btn-group-${member.channels[1].id}`, 'btn-group')
	columnDiv.append(card)
	makeButton(member)
	socialIcons(buttonDiv, member)
	// addddded this --------------------
	if (member.proPublica_id !== undefined) {
		makeButtonForBills(member)
	}
}

function updateForm(user) {
	addressForm.innerHTML = ''
	alert('Please enter your address') // eslint-disable-line
	const formRow = createAndAppendElement('div', addressForm, null, 'form-row')
	const smallCol = createAndAppendElement('div', formRow, null, 'col-sm-5 my-1')
	createAndAppendElement('label', smallCol, null, 'sr-only', (element) => {
		element.setAttribute('for', 'inlineFormAddress')
		element.innerText = 'Address'
	})
	createAndAppendElement('input', smallCol, 'inlineFormAddress', 'form-control', (element) => {
		element.dataset.id = user.id
		element.placeholder = 'Address'
	})
	const buttonCol = createAndAppendElement('div', formRow, null, 'col-sm-3 my-1')
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
	fetch(`http://localhost:3000/users/${id}`, {
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
	})
		.then((response) => response.json())
		.then((userObj) => {
			columnDiv.innerHTML = ''
			fetchFederal(userObj.id)
		})
}

function makeButton(member) {
	const buttonDiv = document.querySelector(`#btn-group-${member.channels[1].id}`)
	const viewButton = document.createElement('button')
	viewButton.innerText = 'Details'
	viewButton.className = 'btn btn-sm btn-outline-secondary'
	viewButton.setAttribute('data-toggle', 'modal')
	viewButton.setAttribute('data-target', '.bd-example-modal-xl')
	viewButton.dataset.id = member.id
	buttonDiv.append(viewButton)
	viewButton.addEventListener('click', () => {
		representativeModalElements(member)
	})
}

function socialIcons(cardBody, member) {
	createAndAppendElement('i', cardBody, null, 'fa fa-twitter', (el) => {
		el.style = 'font-size: 20px;'
		el.dataset.twitter = member.channels[1].id
		el.addEventListener('click', (event) => {
			window.location.href = `https://twitter.com/${event.target.dataset.twitter}?s=10`
		})
	})
}

function representativeModalElements(member) {
	const modalTitle = document.querySelector('#modal-title')
	modalTitle.innerText = member.name
	const tableBody = document.querySelector('#member-info')
	tableBody.innerHTML = ''
	const tr = createAndAppendElement('tr', tableBody, null, null)
	createAndAppendElement('td', tr, null, null, (el) => {
		el.innerText = member.phones[0]
	})
	createAndAppendElement('td', tr, null, null, (el) => {
		el.innerText = member.party
	})
	createAndAppendElement('td', tr, null, null, (el) => {
		el.innerText = `${member.address[0].line1}, ${member.address[0].line2}, ${member.address[0].city}, ${member.address[0].state}, ${member.address[0].zip}`
	})
	createAndAppendElement('td', tr, null, null, (el) => {
		el.innerText = member.urls[0]
	})
}

// addddded this --------------------
function makeButtonForBills(member) {
	const buttonDiv = document.querySelector(`#btn-group-${member.channels[1].id}`)
	createAndAppendElement('button', buttonDiv, null, 'btn btn-sm btn-outline-secondary', (element) => {
		element.innerText = 'Bills'
		element.dataset.proPublica_id = member.proPublica_id
		element.addEventListener('click', wantToSeeActiveBills)
	})
}

// addddded this --------------------
function wantToSeeActiveBills(event) {
	console.log('wants to see bill')
	const button = event.target
	button.innerText = 'Back'
	const cardLeft = document.querySelector(`#card-${event.target.dataset.proPublica_id}`)
	columnDiv.innerHTML = ''
	const row = createAndAppendElement('div', columnDiv, null, 'row w-100 mx-auto')
	row.append(cardLeft)
	button.removeEventListener('click', wantToSeeActiveBills)
	button.addEventListener('click', wantFederalReps)

	fetch(`http://localhost:3000/representatives/${button.dataset.proPublica_id}`) //eslint-disable-line
		.then((response) => response.json())
		.then((bills) => {
			appendBillsToDOM(bills, row)
			console.log(bills)
		})
}

function wantFederalReps(event) {
	const button = event.target
	const userId = columnDiv.dataset.userId
	button.addEventListener('click', wantToSeeActiveBills)
	button.removeEventListener('click', wantFederalReps)
	fetchFederal(userId)
}

function appendBillsToDOM(bills, row) {
	const col = createAndAppendElement('div', row, null, 'col-sm-8 d-flex flex-column wrapper')
	for (const bill of bills) {
		const card = createAndAppendElement('div', col, null, 'card flex-fill mb-4')
		createAndAppendElement('div', card, null, 'card-header', (el) => {
			el.innerText = bill.short_title
		})
		const cardBody = createAndAppendElement('div', card, null, 'card-body d-flex flex-column')
		createAndAppendElement('i', cardBody, null, 'text-muted align-self-end', (el) => {
			el.innerText = `Introduced on: ${bill.introduced_date}`
		})
		createAndAppendElement('div', cardBody, null, 'mt-2 mb-4', (el) => {
			el.innerText = bill.title
		})
		if (bill.userforBill !== undefined) {
			createAndAppendElement('em', cardBody, null, 'text-muted align-self-end', (el) => {
				el.innerText = bill.userforBill ? 'You support this!' : 'You do not support this bill!'
			})
			addRemoveVote(card, bill)
		} else {
			addAgreeButtons(card, bill)
		}
		cardBody.innerHTML += `
    <div class="progress">
      <div class="progress-bar bg-success" role="progressbar" style="width: 100%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">50%</div>
      <div class="progress-bar bg-danger" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">50%</div>
    </div>
    `
	}
}
function addRemoveVote(card, bill) {
	const footer = createAndAppendElement('div', card, null, 'card-footer')
	const footerRow = createAndAppendElement('div', footer, null, 'row w-100 mx-auto')
	const disagreeCol = createAndAppendElement('div', footerRow, null, 'col-12')
	createAndAppendElement('div', disagreeCol, 'btn-vote-against', 'btn btn-danger btn-lg btn-block', (el) => {
		el.innerText = 'Remove my vote'
		el.dataset.vote = 'false'
		el.dataset.billId = bill.bill_id
		el.dataset.sponsorId = bill.sponsor_id
		console.log('need to add event lisenter for this!')
		// el.addEventListener('click', voteForBill)
	})
}

function addAgreeButtons(card, bill) {
	const footer = createAndAppendElement('div', card, null, 'card-footer')
	const footerRow = createAndAppendElement('div', footer, null, 'row w-100')
	const agreeCol = createAndAppendElement('div', footerRow, null, 'col-6')
	createAndAppendElement('div', agreeCol, 'btn-vote-for', 'btn btn-success btn-lg btn-block', (el) => {
		el.innerText = 'Agree'
		el.dataset.vote = 'true'
		el.dataset.billId = bill.bill_id
		el.dataset.sponsorId = bill.sponsor_id
		el.addEventListener('click', voteForBill)
	})
	const disagreeCol = createAndAppendElement('div', footerRow, null, 'col-6')
	createAndAppendElement('div', disagreeCol, 'btn-vote-against', 'btn btn-danger btn-lg btn-block', (el) => {
		el.innerText = 'Disagree'
		el.dataset.vote = 'false'
		el.dataset.billId = bill.bill_id
		el.dataset.sponsorId = bill.sponsor_id
		el.addEventListener('click', voteForBill)
	})
}

function voteForBill(event) {
	const userId = columnDiv.dataset.userId
	fetch(`http://localhost:3000/bills`, {
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
	})
		.then((response) => response.json())
		.then((voteObj) => {
			console.log(voteObj)
			document.querySelector('#btn-vote-against').disabled = true
			document.querySelector('#btn-vote-for').disabled = true
			document.querySelector('#btn-vote-against').removeEventListener('click', voteForBill)
			document.querySelector('#btn-vote-for').removeEventListener('click', voteForBill)
		})
}

function createAndAppendElement(tag, parent, id, className, callback) {
	const element = document.createElement(tag)
	parent.append(element)
	if (id !== null) element.id = id
	if (className !== null) element.className = className
	if (callback !== undefined) callback(element)
	return element
}

const local = document.querySelector('#local-items')
local.addEventListener('click', function (event) {
	console.log('clicked')
	fetch('http://localhost:3000/users') //eslint-disable-line
		.then(function (response) {
			return response.json()
		})
		.then(function (json) {
			console.log(json)
		})
})
