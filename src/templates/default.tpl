{{ title }}

{{ description }}

{{ #if reviewers }}
### CODE REVIEW
{{ #each reviewers }}
- [ ] {{ name }}
{{ /each }}
{{ /if }}

{{ #if testers }}
### Testing
{{ #each testers }}
- [ ] {{ name }}
{{ /each }}
{{ /if }}

{{ #if additionalRequirements }}
### Additional Requirements
{{ #each additionalRequirements }}
- [ ] {{ this }}
{{ /each }}
{{ /if }}
