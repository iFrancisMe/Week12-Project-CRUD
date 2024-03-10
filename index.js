

const TestingMode = false;

function testPoints(location, functionName, message) {
    if (TestingMode === true) {
        console.log(location, `${functionName}:`, message);
    }
}

class Contact {

    #info = []; // Array to keep object. Need data as object for access by reference
    #contactObject = { // Object of contact details
            FirstName: '',
            LastName: '',
            StreetAddress: '',
            City: '',
            StateCode: '',
            ZipCode: '',
            PhoneNumber: '',
            id: ''
        }; 

    constructor(jsonObject) {

        if (jsonObject != undefined) {
            let properties = Object.keys(jsonObject);

            testPoints('Class Contact', 'constructor', `Testing for undefined properties - ${properties}`);

            for (let propertyName of properties) {
                                
                if (jsonObject[propertyName] !== undefined) {
                    this.#contactObject[propertyName] = jsonObject[propertyName]
                } else {
                    
                }
            }

        }
    }

    createContact(firstName, lastName, address, city, stateCode, zipCode, phoneNumber) {
        
        let obj = this.#contactObject;
        obj.FirstName = firstName;
        obj.LastName = lastName;
        obj.StreetAddress = address;
        obj.City = city;
        obj.StateCode = stateCode;
        obj.ZipCode = zipCode;
        obj.PhoneNumber = phoneNumber;

        return this.#contactObject;
    }

    editContactInfo(propertyName, propertyData) { // Modifies property. Returns new value if successful, or returns undefined.
        
        const PROPERTIES = Object.keys(this.#contactObject); // capture properties defined by class into array
        
        // find desired property name from array of predefined property names if exists
        let propertyItem = PROPERTIES.find(property => property.toLowerCase() === propertyName.toLowerCase());
        
        // if property name is valid, proceed to retrieve or modify property data
        if (propertyItem != undefined) {
            
            // if property data given, then proceed to update object property
            this.#contactObject[propertyName] = propertyData;
            
        } else {
            return -1; // value to indicate invalid parameter
        }
    }

    getContactInfo(property) {
        // Returns property value
        return this.#contactObject[property];
    }

    // Returns collection of property names
    getProperties() {
        const PROPERTIES = Object.keys(this.#contactObject); // capture properties defined by class into array
        return PROPERTIES;
    }

    // Returns this object. contactObject is a private field not accessable outside class so it is returned via method
    getContactObject() {
        return this.#contactObject;
    }

    // JSON stringify the contents of the card object to send to API methods
    getContactJSON() {
        return JSON.stringify(this.#contactObject);
    }

}

// Class for managing data sent and received from API requests
class AddressBook {
    
    // Address book. Collection of current set of working data receive since last GET request
    static contacts = [];

    // POST method for adding new record
    static addContact(JSONObject) {
        let result = this.#sendRequest('POST', JSONObject);
        testPoints('Class AddressBook, Method', 'addContact', `Testing result from POST request: ${result}`);

        return result;
    }

    // GET method implemented as a standalone ajax operation so the other methods can call on this method to update the dataset after any API request is made
    static getContacts() {

        const apiURL = "https://65eca26b0ddee626c9b0bb03.mockapi.io/api/v1/contacts/";
        
        return $.ajax({
            type: 'GET',
            url: apiURL,
            contentType: 'Application/json',
            dataType: 'json',
            success: (data) => {
                console.log("SUCCESS:", data);

                let collection = data;

                testPoints('AddressBook', 'getContacts', `Testing Promise received: ${collection[0].FirstName}`);

                testPoints('AddressBook', 'getContacts','Collection length = ' + collection.length)

                this.contacts = [];
                for (let obj of collection) {

                    if (obj != undefined && obj != '') {
                        testPoints(`Ajax Promise`, `getContacts`, `Testing contents of object: ${obj.FirstName}`);

                        let contact = new Contact(obj);
                        testPoints(`Ajax Promise`, `getContacts`, `Testing contents of new contact object: ${contact.getContactObject().FirstName}`);

                        let id = contact.getContactInfo('id');
                        testPoints(`Ajax Promise`, `getContacts`, `Adding contact to contacts array at index ${id}`);
                        
                        console.log(id);
                        this.contacts.push(contact);
                    }
                }

                this.sort('FirstName'); // Sort results. Data sent and received from API service is unsorted

                // Send data to showResults method. 
                // wont have any new data to show unless we send the data after it arrives via promise
                showResults(this.contacts);
            },
            error: (data) => {
                console.log("ERROR:", data);
            }
        });

    }

    // PUT method for modifying an existing record
    static updateContact(id, JSONObject) {
        this.#sendRequest('PUT', JSONObject, id).then(this.getContacts());
    }

    // DELETE method for deleting record
    static deleteContact(id) {
        this.#sendRequest('DELETE', '', id);
    }

    // Method to send the API request
    static #sendRequest(requestMethod, data = '', id = '') {
        testPoints('Class AddressBook, Method:', 'sendRequest', data);
        console.log('sending')
        const apiURL = "https://65eca26b0ddee626c9b0bb03.mockapi.io/api/v1/contacts/";
        
        return $.ajax({
            type: requestMethod,
            url: apiURL + id,
            contentType: 'Application/json',
            data: data,
            dataType: 'json',
            success: (data) => {
                console.log("SUCCESS:", data);
                this.getContacts(); // Get latest collection of data records after every API request
            },
            error: (data) => {
                console.log("ERROR:", data);
            }
        });
    }

    // Sort contacts array by field name string parameter
    static sort(fieldName) {
        this.contacts.sort( function(a, b) {

            let contactA = a.getContactInfo(fieldName).toLowerCase();
            let contactB = b.getContactInfo(fieldName).toLowerCase();

            return (contactA < contactB) ? -1 : (contactA > contactB) ? 1 : 0;
        });

        showResults(this.contacts);
    }

    // Filter array by starting letter for either first name or last name. Used for navbar
    static filter(char) {
        console.log(this.contacts[2].getContactInfo('FirstName').startsWith('T'))
        return this.contacts.filter((contact) => {
            return contact.getContactInfo('FirstName').toLowerCase().startsWith(char) || contact.getContactInfo('LastName').toLowerCase().startsWith(char);
        });
    }
} 



onClick('buttonUpdateContact', () => {

    // Get contact index value from contact card field
    let contactCardIDField = $('#contactIDField');
    let contactID = contactCardIDField.val();

    // Create new empty contact object for filling with details from edit form
    let contactObject = new Contact();

    // Get array of property names from contact object
    const PROPERTIES = contactObject.getProperties();

    // Get array of form fields
    let fields = $('#form1').find('input');

    // Fill properties of new contact object with details from edit form
    for (let index = 0; index < PROPERTIES.length - 1; index++) {  // In the current collection of form fields we do not have the 'id' property to assign yet, so we iterate property fields to next to last property. 'id' field is last.

        // Update contact object with form details. We will a get JSON string from class method and pass to API via AddressBook edit method
        contactObject.editContactInfo(PROPERTIES[index], fields[index].value);

        // Now clear corresponding form field
        fields[index].value = '';
    }

    // Assign contact id to appropriate field. We need the id to send to API for updating existing record
    contactObject.editContactInfo('id', contactID);

    // Send contact object to PUT method
    AddressBook.updateContact(contactID, contactObject.getContactJSON());
    
    // Show default form
    showNewContactForm();

});

// Closes Edit form
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

// Initiates deletion of contact object
onClick('contactCardButtonDelete', () => {
    // Get contact ID value from contact card field
    let contactCardIDField = $('#contactIDField');
    let contactID = contactCardIDField.val();
    
    // Send contact ID to API method for deletion
    AddressBook.deleteContact(contactID);

    // Go back to default view and rebuild contacts data table
    showNewContactForm()
 
});

// Displays Edit form
onClick('contactCardButtonEdit', () => {
    // Show edit form
    showEditContactForm();
});

// Closes contact card display
onClick('contactCardButtonClose', () => {
    // Close contact card and reopen new contact form
    showNewContactForm();
});

// Triggers creation of contact object
onClick('buttonAddContact', () => {

    let fname = document.getElementById('formFirstName').value;
    let lname = document.getElementById('formLastName').value;
    let address = document.getElementById('formAddress1').value;
    let city = document.getElementById('formCity').value;
    let state = document.getElementById('formStateCode').value;
    let zip = document.getElementById('formZipCode').value;
    let phone = document.getElementById('formPhoneNumber').value;

    // Instantiate contact object
    let contactObject = new Contact();

    // Create contact object
    contactObject.createContact(fname, lname, address, city, state, zip, phone);

    // Send object to API via class method
    AddressBook.addContact(contactObject.getContactJSON());
  
    // Clear form fields
    let fields = document.getElementById('form1');

    for (let field of fields) {
        if (field.type != 'button') {
            field.value = '';
        } 
    }

});

// Function to create event listeners
function onClick(id, action) {
    
    let element = document.getElementById(id);
    element.addEventListener('click', action);
    return element;

}

// Displays navbar links to filter contacts by starting character. Only displays links for characters that return a valid collection
function showNavBar() {
    let navBar = $('#navbar');

    // First link shows all contacts. Second list item is empty and is used as a spacer
    let navLinks = `
    <li class="nav-item">
        <a class="nav-link" href="#">All Items</a>
    </li>
    <li class="nav-item">
       
    </li>
    `;

    // For iterating through and determining characters for which contact records exist
    let filterChars = 'abcdefghijklmnopqrstuvwxyz';

    for (let char of filterChars) {
        
        // Only create link if character returns a valid set
        if (AddressBook.filter(char).length > 0) {
            navLinks += `
            <li class="nav-item">
                <a class="nav-link" href="#">${char}</a>
            </li>
            `
        }
        
        navBar.empty()  // Clear navbar before populating
        navBar.append(navLinks); // Apply navbar links
    }

    // Event listener for nav links
    let anchorObjects = navBar.find('a');
    for (let anchor of anchorObjects) {
        anchor.addEventListener('click', function () {

            let char = anchor.innerText;

            if (char.toLowerCase().startsWith('all') === true) {
                showResults(AddressBook.contacts.slice(0))
            } else if (char !== '') {
                let filteredContacts = AddressBook.filter(char);
                showResults(filteredContacts);
            }
        });
    }
}

function showResults(contactsObject) {

    if (contactsObject === undefined) {

        // Exits if no data is passed. Cannot work directly from existing class array because it may be outdated 
        // and then display the wrong data. API methods and other sorting and filter methods will send data here
        return;
    } else { 
        
        testPoints('Function', 'showResults', `data argument received from promise`);

        testPoints('Function', 'showResults', `Testing AddressBook Array item for building table: ${contactsObject.length}`);

        // Data received from ajax promise. Start building table body
        let resultsBody = $('#results').find('tbody');

        let contactID;
        let tableData = '';
        let actionBtn;

        resultsBody.empty();  // Clear table data before building table data

        // Build / Populate table data
        for (let contact of contactsObject) {

            if (contact != undefined) {
                // index value of contact, also id of data object assigned by API service
                contactID = contact.getContactInfo('id');

                // button to display contact card data
                actionBtn = `<input type='button' class=\'btn btn-primary btn-sm\ ' value=\'View\' onclick=\'showContactCardDetails(${contactID});\' />`;
                
                // Assemble table row with data elements
                tableData += `
                <tr class='pt-5 align-text-bottom'>
                    <td>
                        ${contact.getContactInfo('FirstName')}
                    </td>
                    <td>
                        ${contact.getContactInfo('LastName')}
                    </td>
                    <td>
                        ${actionBtn}
                    </td>
                </tr>
                `
            }    
        }
        //console.log(tableData);
        $('#results').find('tbody').append(tableData);
    } 

    // Show navbar filter links
    showNavBar();
}

// Function to hide a div
function hideForm(ID) {
    let formDiv = document.getElementById(ID);

    if (formDiv.classList.contains('collapse') == false) {
        formDiv.classList.add('collapse');
    }
}

// Function to show a div
function showForm(ID) {
    let formDiv = document.getElementById(ID);

    if (formDiv.classList.contains('collapse') == true) {
        formDiv.classList.remove('collapse');
    }
}

// Function to display the default form and hide the other divs
function showNewContactForm() {
    hideForm('contactCard');
    hideForm('contactFormTitleEditContact');
    hideForm('contactFormButtonsEditContact');

    showForm('contactFormTitleAddContact');
    showForm('contactFormButtonsAddContact')
    showForm('contactForm');
}

// Function to show the Edit version of the entry form. This for  is populated by and dependent on contact card form.
function showEditContactForm() {
    hideForm('contactCard');
    hideForm('contactFormTitleAddContact');
    hideForm('contactFormButtonsAddContact');

    showForm('contactFormTitleEditContact');
    showForm('contactFormButtonsEditContact')
    showForm('contactForm');

    // Get contact index value from contact card field
    let contactCardIDField = $('#contactIDField');
    let contactID = contactCardIDField.val();

    // Assign variables to form field objecta
    let fname = $('#formFirstName');
    let lname = $('#formLastName');
    let address = $('#formAddress1');
    let city = $('#formCity');
    let state = $('#formStateCode');
    let zip = $('#formZipCode');
    let phone = $('#formPhoneNumber');

    let contact = AddressBook.contacts.find((obj) => obj.getContactInfo('id') == contactID);

    // Fill in contact card details
    let properties = contact.getProperties(); // Form fields to be assigned in the order corresponding to the object properties defined by contact class
    
    let indexCounter = 0;

    // Assign values to form fields
    fname.val(contact.getContactInfo(properties[indexCounter++]));
    lname.val(contact.getContactInfo(properties[indexCounter++])); 
    address.val(contact.getContactInfo(properties[indexCounter++]));
    city.val(contact.getContactInfo(properties[indexCounter++]));
    state.val(contact.getContactInfo(properties[indexCounter++]));
    zip.val(contact.getContactInfo(properties[indexCounter++]));
    phone.val(contact.getContactInfo(properties[indexCounter++]));
}

// Displays rolodex style contact card with contact details. Also contains a hidden field for storing the current ID of the contact being viewed or edited
function showContactCardDetails(contactID) {

    // Hide contact form and display address card
    let contactForm = document.getElementById('contactForm');
    let contactCard = document.getElementById('contactCard');

    // Add 'collapse' to class list to hide contact form div
    if (contactForm.classList.contains('collapse') === false) {
        contactForm.classList.add('collapse');
    }
    
    // Remove 'collapse' to class list to show address card div
    if (contactCard.classList.contains('collapse') === true) {
        contactCard.classList.remove('collapse');
    }

    let contact = AddressBook.contacts.find((obj) => obj.getContactInfo('id') == contactID);
    
    // Fill in contact card details
    let properties = contact.getProperties();
    
    let indexCounter = 0;

    let fname = contact.getContactInfo(properties[indexCounter++]);
    let lname = contact.getContactInfo(properties[indexCounter++]);
    let address = contact.getContactInfo(properties[indexCounter++]);
    let city = contact.getContactInfo(properties[indexCounter++]);
    let state = contact.getContactInfo(properties[indexCounter++]);
    let zip = contact.getContactInfo(properties[indexCounter++]);
    let phone = contact.getContactInfo(properties[indexCounter++]);

    let contactCardDetails = `
        Name: ${fname} ${lname}<br />
        Address: ${address}<br />
        City: ${city}<br />
        State: ${state} &emsp; &emsp; Zip: ${zip}<br />
        Phone: ${phone}
    `

    // Write template to contact card
    let contactCardObject = document.getElementById('contactCardDetails');
    contactCardObject.innerHTML = contactCardDetails;

    // Write index value to contact card hidden field
    let contactCardIDField = document.getElementById('contactIDField');
    contactCardIDField.value = contactID;
}

// Initial load of contact data. Gets data via API call and stores in local array. Then displays contents of array in a table.
AddressBook.getContacts();