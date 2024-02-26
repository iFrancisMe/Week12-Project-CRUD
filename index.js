
class Contact {

    #info = []; // Array to keep object. Need data as object for access by reference
    constructor(firstName, lastName, address, cityName, stateCode, zipCode, phoneNumber) {
        
        let info = {}; // Object of contact details
        
        let obj = info;
        obj.FirstName = firstName;
        obj.LastName = lastName;
        obj.StreetAddress = address;
        obj.CityName = cityName;
        obj.StateCode = stateCode;
        obj.ZipCode = zipCode;
        obj.PhoneNumber = phoneNumber;
        //console.log(typeof(this['firstName']));
        this.#info.push(info);
    }

    editContactInfo(propertyName, propertyData) { // Modifies property. Returns new value if successful, or returns undefined.
        
        const PROPERTIES = Object.keys(this.#info[0]); // capture properties defined by class into array
        
        // find desired property name from array of predefined property names if exists
        let propertyItem = PROPERTIES.find(property => property.toLowerCase() === propertyName.toLowerCase());
        
        // if property name is valid, proceed to retrieve or modify property data
        if (propertyItem != undefined) {
            
            // if no data value given as parameter, just return existing value. This is meant for sibling method to retrieve property data
            if (propertyData == undefined) {
                return this.#info[0][propertyName];
            }

            // if property data given, then proceed to update object property
            this.#info[0][propertyName] = propertyData;
            
            //console.log(`property value = ${this.#info[0][propertyName]} and parameter = ${propertyData}`)
            // Check result
            if (this.#info[0][propertyName] === propertyData) {
                return 1; // value to indicate success
            } else {
                return 0; // value to indicate unsuccessful update
            }
        } else {
            return -1; // value to indicate invalid parameter
        }
    }

    getContactInfo(property) {
        // All the logic already in previous method so no need to reinvent wheel
        return this.editContactInfo(property);
    }

    getProperties() {
        const PROPERTIES = Object.keys(this.#info[0]); // capture properties defined by class into array
        return PROPERTIES;
    }
}

class AddressBook {
    constructor() {

        this.contacts = [];
    }

    addContact(contactObject) {
        if (typeof(contactObject) === 'object' && contactObject instanceof Contact) {
            this.contacts.push(contactObject);
        } else {
            throw('Not a valid contact object')
        }
    }
} 


let book = new AddressBook();

onClick('buttonUpdateContact', () => {

    // Get contact index value from contact card field
    let contactCardIndexField = document.getElementById('contactIndexField');
    let contactIndex = contactCardIndexField.value;

    // Get array of property names from contact object
    const PROPERTIES = book.contacts[contactIndex].getProperties();

    // Get array of form fields
    let fields = document.getElementById('form1');

    for (let index = 0; index < PROPERTIES.length; index++) {

        // Update addressbook with values from form field
        book.contacts[contactIndex].editContactInfo(PROPERTIES[index], fields[index].value);

        // Now clear corresponding form field
        fields[index].value = '';
    }

    showResults(); 
});

onClick('buttonCancelUpdate', () => {
    
    // Clear form fields
    let fields = document.getElementById('form1');

    for (let field of fields) {
        if (field.type != 'button') {
            field.value = '';
        } 
    }

    // Return to default view
    showNewContactForm();
});

onClick('contactCardButtonDelete', () => {
    // Get contact index value from contact card field
    let contactCardIndexField = document.getElementById('contactIndexField');
    let contactIndex = contactCardIndexField.value;
    
    // Remove contact at index value
    book.contacts.splice(contactIndex, 1);

    // Go back to default view and rebuild contacts data table
    showNewContactForm()
    showResults();
});

onClick('contactCardButtonEdit', () => {
    // Show edit form
    showEditContactForm();
});

onClick('contactCardButtonClose', () => {
    // Close contact card and reopen new contact form
    showNewContactForm();
});

onClick('buttonAddContact', () => {

    let fname = document.getElementById('formFirstName').value;
    let lname = document.getElementById('formLastName').value;
    let address = document.getElementById('formAddress1').value;
    let city = document.getElementById('formCityName').value;
    let state = document.getElementById('formStateCode').value;
    let zip = document.getElementById('formZipCode').value;
    let phone = document.getElementById('formPhoneNumber').value;

    // document.getElementById('form1').reser();
    book.addContact(new Contact(fname, lname, address, city, state, zip, phone));

    showResults();
    
    // Clear form fields
    let fields = document.getElementById('form1');

    for (let field of fields) {
        if (field.type != 'button') {
            field.value = '';
        } 
    }
});

function onClick(id, action) {
    let element = document.getElementById(id);
    element.addEventListener('click', action);
    return element;
}

function showResults() {

    let resultsTable = document.getElementById('results');
    let resultsData = resultsTable.getElementsByTagName('tbody')[0];
    
    resultsData.innerHTML = ''; // Clear table data before rebuilding

    book.contacts.forEach( (contact, contactIndex) => {
        let newRow = resultsData.insertRow();
        newRow.classList = 'pt-5 align-text-bottom';

        newRow.insertCell().innerHTML = contact.getContactInfo('FirstName');
        newRow.insertCell().innerHTML = contact.getContactInfo('LastName');

        // Build Action Button
        let actionBtn = `<input type='button' class=\'btn btn-primary btn-sm\ ' value=\'View\' onclick=\'showContactCardDetails(${contactIndex});\' />`;
        newRow.insertCell().innerHTML = actionBtn;
    });
}

function hideForm(ID) {
    let formDiv = document.getElementById(ID);

    if (formDiv.classList.contains('collapse') == false) {
        formDiv.classList.add('collapse');
    }
}

function showForm(ID) {
    let formDiv = document.getElementById(ID);

    if (formDiv.classList.contains('collapse') == true) {
        formDiv.classList.remove('collapse');
    }
}

function showNewContactForm() {
    hideForm('contactCard');
    hideForm('contactFormTitleEditContact');
    hideForm('contactFormButtonsEditContact');

    showForm('contactFormTitleAddContact');
    showForm('contactFormButtonsAddContact')
    showForm('contactForm');
}

function showEditContactForm() {
    hideForm('contactCard');
    hideForm('contactFormTitleAddContact');
    hideForm('contactFormButtonsAddContact');

    showForm('contactFormTitleEditContact');
    showForm('contactFormButtonsEditContact')
    showForm('contactForm');

    // Get contact index value from contact card field
    let contactCardIndexField = document.getElementById('contactIndexField');
    let contactIndex = contactCardIndexField.value;

    let fname = document.getElementById('formFirstName');
    let lname = document.getElementById('formLastName');
    let address = document.getElementById('formAddress1');
    let city = document.getElementById('formCityName');
    let state = document.getElementById('formStateCode');
    let zip = document.getElementById('formZipCode');
    let phone = document.getElementById('formPhoneNumber');

    let contact = book.contacts[contactIndex];

    // Fill in contact card details
    let properties = book.contacts[contactIndex].getProperties();
    
    let indexCounter=0;

    fname.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
    lname.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
    address.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
    city.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
    state.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
    zip.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
    phone.value = book.contacts[contactIndex].getContactInfo(properties[indexCounter++]);
}

function showContactCardDetails(indexValue) {

    // Hide contact form and display address card
    let contactForm = document.getElementById('contactForm');
    let addressCard = document.getElementById('contactCard');

    // Add 'collapse' to class list to hide contact form div
    if (contactForm.classList.contains('collapse') === false) {
        contactForm.classList.add('collapse');
    }
    
    // Remove 'collapse' to class list to show address card div
    if (contactCard.classList.contains('collapse') === true) {
        contactCard.classList.remove('collapse');
    }

    // Fill in contact card details
    let properties = book.contacts[indexValue].getProperties();
    
    let indexCounter=0;

    let fname = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);
    let lname = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);
    let address = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);
    let city = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);
    let state = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);
    let zip = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);
    let phone = book.contacts[indexValue].getContactInfo(properties[indexCounter++]);

    let contactCardDetails = `
        Name: ${fname} ${lname}<br />
        Address: ${address}<br />
        City: ${city}<br />
        State: ${state} &emsp; &emsp; Zip: ${zip}<br />
    `

    // Write template to contact card
    let contactCardObject = document.getElementById('contactCardDetails');
    contactCardObject.innerHTML = contactCardDetails;

    // Write index value to contact card hidden field
    let contactCardIndexField = document.getElementById('contactIndexField');
    contactCardIndexField.value = indexValue;
}

