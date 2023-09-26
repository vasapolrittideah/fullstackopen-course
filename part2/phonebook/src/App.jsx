import { useState, useEffect } from "react";
import personService from "./services/persons";

const Notification = ({ message, type }) => {
  if (message === null) {
    return null;
  }

  return <div className={type}>{message}</div>;
};

const Persons = ({ filter, persons, handlePersonDelete }) => {
  return (
    <ul>
      {(filter === ""
        ? persons
        : persons.filter((person) => person.name.toLowerCase().includes(filter))
      ).map((person) => (
        <li key={person.name}>
          <span>
            {person.name} {person.number}
          </span>
          <button onClick={() => handlePersonDelete(person)}>delete</button>
        </li>
      ))}
    </ul>
  );
};

const PersonForm = ({
  nameValue,
  numberValue,
  handleNameChange,
  handleNumberChange,
  handleFormSubmit,
}) => {
  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        name: <input value={nameValue} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={numberValue} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Filter = ({ value, handleChange }) => {
  return (
    <div>
      filter show with <input value={value} onChange={handleChange} />
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState(null);
  const [filter, setFilter] = useState("");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [message, setMessage] = useState({ message: null, type: "" });

  useEffect(() => {
    personService.getPersons().then((persons) => setPersons(persons));
  }, []);

  if (!persons) {
    return null;
  }

  const handleFormSubmit = (event) => {
    event.preventDefault();

    // If a number is added to an already existing user, the new number will
    // replace the old number.
    const person = persons.find((_person) => {
      return _person.name.toLowerCase() === newName.toLowerCase();
    });
    if (person) {
      if (
        window.confirm(
          `${person.name} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        personService
          .updatePerson(person.id, { ...person, number: newNumber })
          .then((returnedPerson) => {
            setPersons(
              persons.map((_person) =>
                _person.id === person.id ? returnedPerson : _person
              )
            );
            setNewName("");
            setNewNumber("");
          })
          .catch(() => {
            setMessage({
              message: `Information of ${person.name} has already been removed from server`,
              type: "error",
            });

            setTimeout(() => {
              setMessage({ message: null, type: "" });
            }, 5000);

            setNewName("");
            setNewNumber("");
          });
      }
      return;
    }

    const newPerson = {
      name: newName,
      number: newNumber,
    };

    personService
      .createPerson(newPerson)
      .then(() => {
        setMessage({
          message: `Added ${newPerson.name}`,
          type: "message",
        });

        setTimeout(() => {
          setMessage({ message: null, type: "" });
        }, 5000);

        setPersons(persons.concat(newPerson));
        setNewName("");
        setNewNumber("");
      })
      .catch((error) => {
        setMessage({
          message: error.response.data.error,
          type: "error",
        });
      });
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value.toLowerCase());
  };

  const handlePersonDelete = (person) => {
    if (window.confirm(`Delete ${person.name}`)) {
      personService.deletePerson(person.id).then(() => {
        setPersons(persons.filter((_person) => _person.id !== person.id));
      });
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message.message} type={message.type} />
      <Filter value={filter} handleChange={handleFilterChange} />
      <h2>Add a new</h2>
      <PersonForm
        nameValue={newName}
        numberValue={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        handleFormSubmit={handleFormSubmit}
      />
      <h2>Numbers</h2>
      <Persons
        filter={filter}
        persons={persons}
        handlePersonDelete={handlePersonDelete}
      />
    </div>
  );
};

export default App;
