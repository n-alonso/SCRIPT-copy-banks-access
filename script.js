// Destination Applications to delegate banks to
const DELEGATED_APPLICATIONS = [
    "APPLICATION_1",
    "APPLICATION_2",
    "ETC"
];
// Banks to delegate
const DELEGATED_INSTITUTIONS = [
    "BANK_1",
    "BANK_2",
    "ETC"
];

// Initiate indexes to serve as counters to pass inbetween Postman requests
const LAST_INSTITUTION_INDEX = DELEGATED_INSTITUTIONS.length - 1;
const LAST_APPLICATION_INDEX = DELEGATED_APPLICATIONS.length - 1;

// Set local collection variables for the current application and bank, so Postman can use them when the collection runs
function setDelegatedApplication(appIndex) {
    pm.collectionVariables.set("delegated-application-index", appIndex);
    pm.collectionVariables.set("delegated-application-id", DELEGATED_APPLICATIONS[appIndex]);
}
function setDelegatedInstitution(institutionIndex) {
    pm.collectionVariables.set("delegated-institutions-index", institutionIndex);
    pm.collectionVariables.set("delegated-institution-id", DELEGATED_INSTITUTIONS[institutionIndex]);
}

// When the collection starts to run, check if the pprevious variables exist
if (!pm.collectionVariables.has("delegated-institutions-index") ||
    !pm.collectionVariables.has("delegated-application-index") ||
    !pm.collectionVariables.has("delegated-institution-id") ||
    !pm.collectionVariables.has("delegated-application-id")) {
    // If not, we set them to the 0 defaults, and restart bulk delegation
    setDelegatedInstitution(0)
    setDelegatedApplication(0)
    postman.setNextRequest("Delegation Request");
} else {
    // Result needs to be either a success or conflict (meaning that it already exists, which is fine)
    pm.expect(pm.response.code).to.be.oneOf([201, 409]);

    // Extract (temporary/nullable) delegation variables from collection
    const delegatedInstIndex = parseInt(pm.collectionVariables.get("delegated-institutions-index"));
    const delegatedAppIndex = parseInt(pm.collectionVariables.get("delegated-application-index"));

    // Set next request to make
    if (delegatedInstIndex === LAST_INSTITUTION_INDEX && delegatedAppIndex === LAST_APPLICATION_INDEX) {
        // 1. If both the app and the institution are the last items in their arrays, stop delegation, and clear delegation variables
        pm.collectionVariables.unset("delegated-institution-id");
        pm.collectionVariables.unset("delegated-application-id");
        pm.collectionVariables.unset("delegated-institutions-index");
        pm.collectionVariables.unset("delegated-application-index");
    } else if (pm.response.code === 401) {
        // 2. If the response is Unauthorised, get another access token
        postman.setNextRequest("Dashboard Access Token");
    } else {
        // Notify of conflicts for already existing delegations
        if (pm.response.code === 409) {
            console.info(`Delegation to application: ${DELEGATED_APPLICATIONS[delegatedAppIndex]} for institution: ${DELEGATED_INSTITUTIONS[delegatedInstIndex]} already exists`);
        }

        // 3. In any other case just keep doing delegations
        postman.setNextRequest("Delegation Request");

        // Update counters for next request
        const nextInstIndex = delegatedInstIndex + 1;
        const nextAppIndex = delegatedAppIndex + 1;
        if (delegatedInstIndex === LAST_INSTITUTION_INDEX) {
            // 1. If the institution is the last one in the array, jump to the next application and to the first institution
            setDelegatedInstitution(0);
            setDelegatedApplication(nextAppIndex);
        } else {
            // 2. If the institution is NOT the last one in the array, jump to the next institution
            setDelegatedInstitution(nextInstIndex)
        }
    }
}