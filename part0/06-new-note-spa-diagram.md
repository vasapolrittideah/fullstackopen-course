# New note in single page app diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa w/ Request Payload
    activate server
    server-->>browser: 201 w/ Response in JSON {"message":"note created"}
    deactivate server
```
