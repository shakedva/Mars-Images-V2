//the main closure of the project
(function ()
{
    const Curiosity = 0, Opportunity = 1, Spirit = 2; //missions consts
    let isThereSlides = false; //updates to true once there are images to show as slides
    const dbAddress = '/api/image/';
    const nasaManifestsAddress = 'https://api.nasa.gov/mars-photos/api/v1/manifests/',
          nasaRoversAddress = 'https://api.nasa.gov/mars-photos/api/v1/rovers/',
          nasaApiKey = 'api_key=A5WCxvxr2JgvJsDQ1LrU0xrFsdegK38a3J7HnwdR';
    const serverError = `server is not available right now, please try again later`;

    /**
     * this function checks the response status and if it is between 200 to 300 it sends Promise.resolve
     * otherwise it sends Promise.reject
     * @param response
     * @returns {Promise<never>|Promise<unknown>}
     */
    function status(response)
    {
        if (response.status >= 200 && response.status < 300)
        {
            return Promise.resolve(response)
        } else
        {
            return Promise.reject(new Error(response.statusText))
        }
    }

    /**
     * namespace for all the missions
     * @type {{getLand: (function(*): *),
     * getCameras: (function(*): []|*|string[]),
     * getMaxSol: (function(*): *),
     * getMaxEarth: (function(*): *),
     * getMissionImages: getMissionImages}}
     */
    const Missions = (function ()
    {
        //mission class
        class Mission
        {
            constructor(name, index)
            {
                this.missionName = name;
                this.missionInfo = [];
                this.cameraList = [];
                this.getInfo();
                this.getCameras(index);
            }

            /**
             * this function creates a fetch out of the given url, and extracts information into the missionInfo
             * member of the class Mission. It catches errors and disables the search button in that case.
             */
            getInfo()
            {
                fetch(`${nasaManifestsAddress}${this.missionName}?${nasaApiKey}`)
                    .then(status)
                    .then(res => res.json())
                    .then(json =>
                    {
                        this.missionInfo.push(json.photo_manifest.landing_date);
                        this.missionInfo.push(json.photo_manifest.max_date);
                        this.missionInfo.push(json.photo_manifest.max_sol);
                    })
                    .catch(function (err)
                    {
                        document.getElementById("searchBtn").classList.add("disabled");
                        document.querySelector("#data").innerHTML = `<h5> <b>NASA ${serverError}</b> </h5>`

                    });
            }

            /**
             * this function receives a mission and adds its camera list accordingly
             * @param mission
             */
            getCameras(mission)
            {
                switch (mission)
                {
                    case Curiosity:
                        this.cameraList = ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'];
                        break;
                    default:
                        this.cameraList = ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'];
                        break;
                }
            }

            /**
             * receives a date and a camera and according to the matching url, extracts all images available for them.
             * the mission name is already saves in the class member.
             * @param date - by sol date or earth date
             * @param camera
             */
            searchMissionImages(date, camera)
            {
                let address = `${nasaRoversAddress}${this.missionName}/photos?`;
                let sol = `sol=${date}&camera=${camera}&${nasaApiKey}`;
                let earth = `earth_date=${date}&camera=${camera}&${nasaApiKey}`;
                address += (date.length < 5 && date > 0) ? sol : earth; //check if its a sol or an earth date

                //add a gif of "loading" until the images are shown
                document.querySelector("#gifSection").classList.remove("d-none");
                fetch(address)
                    .then(status)
                    .then(res => res.json())
                    .then(json =>
                    {
                        let counter = 0; //will tell if this camera has photos for that day
                        document.querySelector("#gifSection").classList.add("d-none");
                        for (let photo of json.photos) //add photos to the page
                        {
                            counter++;
                            document.querySelector("#data").innerHTML += `
                            <div class="col md-1" style="margin-bottom: 15px; margin-right: 15px">
                                 <div class="card" id="${photo.id}" style="width: 18rem ;">
                                    <img src="${photo.img_src}" class="card-img-top img-fluid" id="cardImg" alt="mars photo">
                                    <div class="card-body">
                                        <p class="card-text">    
                                            Mission: ${this.missionName}<br/>
                                            Sol: ${photo.sol} <br/>
                                            Earth day: ${photo.earth_date}<br/>
                                            Camera: ${camera} <br/>
                                            <span class="d-none">Image id: ${photo.id} </span>
                                        </p>
                                        
                                          <button type="button" class="btn-save btn" style="border: 2px solid #ff5722;">Save</button>  
                                         <a href="${photo.img_src}" class="btn" style="border: 2px solid #b91400;" target="_blank">Full Size </a>
                                     </div>
                               </div>
                            </div>`;
                        }
                        if (counter === 0) //if this camera doesn't have photos for that day
                            document.querySelector("#data").innerHTML = `<h5> <b>No Images Found</b> </h5>`;

                        let bs; //button save- we'll add listeners to each one
                        bs = document.getElementsByClassName("btn-save");//add a listener to each button
                        for (let b of bs)
                            b.addEventListener('click', saveAnImg);

                    })
                    .catch(function (err)
                    {
                        document.querySelector("#gifSection").classList.add("d-none");
                        document.querySelector("#data").innerHTML = `<h5> <b>NASA ${serverError}</b> </h5>`
                    });
            };
        }

        //create an instance of all 3 missions and save them in a list
        let missionList = [];
        let c = new Mission('Curiosity', Curiosity);
        missionList.push(c);
        let o = new Mission('Opportunity', Opportunity);
        missionList.push(o);
        let s = new Mission('Spirit', Spirit);
        missionList.push(s);

        /**
         * @param missionName
         * @returns the landing date for that mission
         */
        const getLand = (missionName) =>
        {
            return missionList[missionName].missionInfo[0];
        }
        /**
         * @param missionName
         * @returns the last earth date for that mission
         */
        const getMaxEarth = (missionName) =>
        {
            return missionList[missionName].missionInfo[1];
        }
        /**
         * @param missionName
         * @returns the last sol date for that mission
         */
        const getMaxSol = (missionName) =>
        {
            return missionList[missionName].missionInfo[2];
        }
        /**
         * @param missionName
         * @returns the available cameras for that mission
         */
        const getCameras = (missionName) =>
        {
            return missionList[missionName].cameraList;
        }
        /**
         * search all images related to that mission, camera and date
         * @param missionName
         * @param date
         * @param camera
         */
        const getMissionImages = (missionName, date, camera) =>
        {
            missionList[missionName].searchMissionImages(date, camera); //  return
        }
        return { //create public names for the class functions so they can be used outside class scope
            getLand: getLand,
            getMaxEarth: getMaxEarth,
            getMaxSol: getMaxSol,
            getCameras: getCameras,
            getMissionImages: getMissionImages
        }
    })();

    /**
     * a module to validate all parameters and combinations of cameras/dates/missions
     * @type {{dateValidator: (function(*=, *=): {isValid: boolean, message: string}),
     *       datePatternValidator: (function(*=): {isValid: boolean, message: string}),
     *       missionSelectedValidator: (function(*): {isValid: boolean, message: string}),
     *       cameraExistsValidator: (function(*, *=): {isValid: boolean, message: string}),
     *       cameraSelectedValidator: (function(*): {isValid: boolean, message: string})}}
     */
    const validatorModule = (function ()
    {
        /**
         * checks whether the date is sol or earth date, validate it and return if it's valid and an error message in
         * case it's not valid
         * @param date
         * @returns {{isValid: boolean, message: string}}
         */
        const datePatternValidator = function (date)
        {
            let v = (date.length > 0 && date.length < 5) ? getRegexSol().test(date) : getRegexDate().test(date);
            return {
                isValid: v,
                message: 'Please enter a date yyyy-mm-dd or a Sol date'
            }
        }
        /**
         * checks if a mission wad selected, return if it's valid and an error message in
         * case it's not valid
         * @param mission
         * @returns {{isValid: boolean, message: string}}
         */
        const missionSelectedValidator = function (mission)
        {
            let v = true;
            if (mission === 'Choose a mission')
                v = false;
            return {
                isValid: v,
                message: 'Please choose a mission'
            }
        }
        /**
         * receive an earth date and a given date, returns the dates seperated to day, month and year.
         * each date is a string "yyyy-mm-dd" and returns a list [yyyy, mm, dd]
         * @param date
         * @param mission
         * @returns {{from: Date, to: Date, check: Date}}
         */
        const isDateInRange = function (date, mission)
        {
            let dateFrom = Missions.getLand(mission);
            let dateTo = Missions.getMaxEarth(mission);

            let d1 = dateFrom.split("-");
            let d2 = dateTo.split("-");
            let c = date.split("-");

            let from = new Date(d1[0], parseInt(d1[1]) - 1, d1[2]);  // -1 because months are from 0 to 11
            let to = new Date(d2[0], parseInt(d2[1]) - 1, d2[2]);
            let check = new Date(c[0], parseInt(c[1]) - 1, c[2]);

            return {
                from: from,  // landing date
                to: to,      // max earth date
                check: check // the date received
            }
        }
        /**
         * checks if the mission was active in the date received.
         * @param date
         * @param mission
         * @returns {{isValid: boolean, message: string}}
         */
        const dateValidator = function (date, mission)
        {
            let msg = '', isVali = true;
            let execDate = extractDate(date);
            if (execDate.month == null) // the date is a sol date
            {
                if (Missions.getMaxSol(mission) < execDate.year)
                {
                    msg = "Sol must be smaller than " + Missions.getMaxSol(mission);
                    isVali = false;
                }
            } else //earth date
            {
                // d is a list that hold the date received, land, max seperated to [yyyy, mm, dd].
                let d = isDateInRange(date, mission);
                if (d.check < d.from)
                {
                    msg = "The mission you've selected requires a date after " + Missions.getLand(mission);
                    isVali = false;
                } else if (d.check > d.to)
                {
                    msg = "The mission you've selected requires a date before " + Missions.getMaxEarth(mission);
                    isVali = false;
                }
            }
            return {
                isValid: isVali,
                message: msg,
            }
        }
        /**
         * checks if a camera was active in the given mission.
         * @param camera
         * @param mission
         * @returns {{isValid: boolean, message: string}}
         */
        const cameraExistsValidator = function (camera, mission)
        {
            let found = false;
            // iterate through the camera's list of the mission
            for (let m of Missions.getCameras(mission))
            {
                if (camera === m)
                    found = true;
            }
            return {
                isValid: found,
                message: "The camera you've chosen does not apply to this mission"
            }
        }
        /**
         * checks if the user entered a camera
         * @param camera
         * @returns {{isValid: boolean, message: string}}
         */
        const cameraSelectedValidator = function (camera)
        {
            let v = true;
            if (camera === 'Choose a camera')
                v = false;
            return {
                isValid: v,
                message: 'Please choose a camera'
            }
        }
        // returns the function of the namespace 'validatorModule'
        return {
            datePatternValidator: datePatternValidator,
            dateValidator: dateValidator,
            missionSelectedValidator: missionSelectedValidator,
            cameraExistsValidator: cameraExistsValidator,
            cameraSelectedValidator: cameraSelectedValidator
        }
    })();
    /**
     * receives an image record information and add it the the saved images section
     * @param x
     * @returns HTML output
     *  btn btn-outline-secondary
     */
    const addImageRecord = (x) =>
    {
        let hide = document.getElementById("editBtn").classList.contains("inEditMode") ? "" : "d-none";
        return `<li id="${x.imageId}">
                    <button type="button" class="deleteBtn ${hide}"> x </button>
                    <a href="${x.url}" target="_blank">Image id: ${x.imageId}</a>
                    <br/> Mission: ${x.mission}, Sol: ${x.sol}, Earth Date: ${x.earthDate}, Camera: ${x.camera}
                </li>`;
    }
    /**
     * receives an image record information and add its data to the carousel
     * @param x
     * @returns HTML output
     */
    const addCarouselItem = (x) =>
    {
        return `<div class="carousel-item">
                    <img src="${x.url}" class="d-block w-50" alt="mars photo">
                    <div class="carousel-caption">
                        <span style="background-color: #6c757d;color: white"> Mission: ${x.mission}, Sol: ${x.sol}, Earth Date: ${x.earthDate}, Camera: ${x.camera}</span>
                        <br/>
                        <a href="${x.url}" class="btn  btn-secondary" target="_blank">Full Size</a>
                    </div>
                </div>`;
    }
    /**
     * This function fetches an api that deletes the image requested
     */
    const deleteAnImage = (event) =>
    {
        fetch(`${dbAddress}${event.target.parentElement.id}`, {
            method: 'DELETE'
        })
            .then(status)
            .then(res => res.json())
            .then(json =>
            {
                if(json.delete === true)
                    getUserImgs();

                else if(json.delete === false) // could not delete in the api
                    throw "";

                else if(json.delete === "not logged") // session expired/deleted
                    document.getElementById("logoutBtn").click();
            })
            .catch(function ()
            {
                document.getElementById("savedImgSection").innerHTML = `Could not delete, the ${serverError}`
            });
    }
    /**
     * This function fetches an api that receives all the user's images and displays them in the saves images section
     */
    const getUserImgs = () =>
    {
        document.querySelector("#gifSection").classList.remove("d-none")
        fetch(`${dbAddress}`, {
            method: 'GET'
        })
            .then(status)
            .then(res => res.json())
            .then(json =>
            {
                if(JSON.stringify(json) === 'not logged')
                    document.getElementById("logoutBtn").click();
                else if(JSON.stringify(json) === 'error')
                    throw "";
                document.getElementById("savedImgSection").innerHTML = json.map(x => addImageRecord(x)).join("");
                let delBtns; // we'll add listeners to each one of the delete buttons
                delBtns = document.getElementsByClassName("deleteBtn");//add a listener to each button
                for (let d of delBtns)
                    d.addEventListener('click', deleteAnImage);

                let c = document.getElementById("carousel-inner"); //add the image as a possible carousel item
                c.innerHTML = json.map(x => addCarouselItem(x)).join("");
                if (JSON.stringify(json) !== '[]') //make slide show option active if there are available images
                {
                    document.getElementById("carousel-inner").lastElementChild.classList.add("active");
                    isThereSlides = true;
                }
                else // there are no saved images
                {
                    isThereSlides = false;
                    document.getElementById("stopSlidShowBtn").click();
                }
                document.querySelector("#gifSection").classList.add("d-none")
            })
            .catch(function ()
            {
                document.querySelector("#gifSection").classList.add("d-none")
                document.getElementById("savedImgSection").innerHTML = `The ${serverError}`
            });
    }
    /**
     * This function extracts the image data from the relevant card and returns its data.
     * @param imageId
     * @param link
     * @param splitInfo
     * @returns {{sol: string, mission: string, imageId: string, earthDate: string, camera: string, url: string}}
     */
    const extractImgData = (imageId, link, splitInfo) =>
    {
        imageId = imageId.split(":")[1].trim();
        let mission = splitInfo[0].split(":")[1].trim();
        let sol = splitInfo[1].split(":")[1].trim();
        let earth = splitInfo[2].split(":")[1].trim();
        let camera = splitInfo[3].split(":")[1].trim();
        return{
            imageId:imageId, url: `${link}`, sol: sol, earthDate: earth, camera:camera, mission:mission
        }
    }

    /**
     * saves an image according to the current event clicked by fetching an api that updates the data base
     * and then display it in the saved image section
     * @param event
     */
    const saveAnImg = (event) =>
    {
        let parentElem = event.currentTarget.parentElement;
        let info = parentElem.firstElementChild;
        let link = parentElem.lastElementChild;
        let imageId = info.lastElementChild.innerHTML;
        let splitInfo = info.innerHTML.split("<br>");
        const imgData = extractImgData(imageId, link, splitInfo);
        fetch(`${dbAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(imgData)
        })
            .then(status)
            .then(res => res.json())
            .then(json =>
            {
                if (json.image === true)
                    getUserImgs();
                else if(json.image === false)// the image is already saved, show informative modal
                    document.getElementById("ghostBtn").click();
                else // the user is not logged into session
                    document.getElementById("logoutBtn").click();
            })
            .catch(function ()
            {
                document.getElementById("savedImgSection").innerHTML = `Could not save the image. <br/> The ${serverError}`
            });
    }
    /**
     * This function fetches an api that deletes all the user's images from the data base and from the saved image section
     */
    const clearAll = () =>
    {
        clearErrorMsg();
        fetch(`${dbAddress}`, {
            method: 'DELETE'
        })
            .then(status)
            .then(res => res.json())
            .then(json =>
            {
                if(json.delete === true)
                {
                    getUserImgs();
                    document.getElementById("editBtn").click();
                    document.getElementById("clearAllBtn").classList.add("d-none");
                }
                else if(json.delete === false) // could not delete in the api
                    throw "";
                else if(json.delete === "not logged") // session expired/deleted
                    document.getElementById("logoutBtn").click();
            })
            .catch(function ()
            {
                document.getElementById("savedImgSection").innerHTML = `Could not delete, the ${serverError}`
            });
    }
    /**
     * checks if the date is a sol or earth date and extract it's year, month and day.
     * @param date
     * @returns {{month: string, year: string, day: string}|{month: null}}
     */
    const extractDate = (date) =>
    {
        let date_regex;
        if (date.length > 0 && date.length < 5)
            date_regex = getRegexSol();
        else
            date_regex = getRegexDate();

        let match = date_regex.exec(date);
        if (match == null)
        {
            return {month: null}
        }
        return {
            year: match[1],
            month: match[3],
            day: match[4]
        }
    }
    /**
     * @returns {RegExp} regular expression for an earth date
     */
    const getRegexDate = () =>
    {
        return /^(\d{4})([\-](0[1-9]|1[012])[\-](0[1-9]|[12][0-9]|3[01]))$/;
    }
    /**
     * @returns {RegExp} regular expression for a sol date
     */
    const getRegexSol = () =>
    {
        return /^(\d{1,4})$/;
    }
    /**
     * receives all the elements the user entered, and check if they are all valid with each other.
     * @param theDateElem
     * @param theMissionElem
     * @param theCameraElem
     * @returns {boolean|*}
     */
    const validateForm = (theDateElem, theMissionElem, theCameraElem) =>
    {
        theDateElem.value = theDateElem.value.trim();
        // check if all fields were entered / selected
        let v1 = validateSingleInput(theDateElem, validatorModule.datePatternValidator);
        let v2 = validateSingleInput(theMissionElem, validatorModule.missionSelectedValidator);
        let v3 = validateSingleInput(theCameraElem, validatorModule.cameraSelectedValidator);
        if (!v1 || !v2 || !v3)
            return false;
        // check combination of the fields
        let v4 = validateDoubleInput(theDateElem, theMissionElem, validatorModule.dateValidator);
        let v5 = validateDoubleInput(theCameraElem, theMissionElem, validatorModule.cameraExistsValidator);
        return (v4 && v5);
    }
    /**
     * check if input element is valid (by itself)
     * @param inputElem
     * @param validateFunc
     * @returns {*}
     */
    const validateSingleInput = (inputElem, validateFunc) =>
    {
        let errorElement = inputElem.nextElementSibling; // the error message div
        let v = validateFunc(inputElem.value); // call the validation function
        return checkValidAndDisplayError(v, inputElem, errorElement);

    }
    /**
     * check if the combination of both input elements received is valid
     * @param inputElem1
     * @param inputElem2
     * @param validateFunc
     * @returns {*}
     */
    const validateDoubleInput = (inputElem1, inputElem2, validateFunc) =>
    {
        let errorElement = inputElem1.nextElementSibling; // the error message div
        let v = validateFunc(inputElem1.value, inputElem2.value); // call the validation function
        return checkValidAndDisplayError(v, inputElem1, errorElement);
    }
    /**
     * display the error message in case in case v is invalid below the matching input element
     * @param v
     * @param inputElem
     * @param errorElem
     * @returns {*}
     */
    const checkValidAndDisplayError = (v, inputElem, errorElem) =>
    {
        errorElem.innerHTML = v.isValid ? '' : v.message; // display the error message
        v.isValid ? inputElem.classList.remove("is-invalid") : inputElem.classList.add("is-invalid");
        return v.isValid;
    }
    /**
     * clears the previous search images
     * checks if the new form is valid and display the new images accordingly
     */
    const searchImages = () =>
    {
        document.querySelector("#data").innerHTML = '';
        let data = getSearchData(); // data holds the extracted date, mission and camera elements.
        if (validateForm(data.date, data.mission, data.camera))
            Missions.getMissionImages(data.mission.value, data.date.value, data.camera.value);
    }
    /**
     * initialize the search parameters
     */
    const clearSearchData = () =>
    {
        let data = getSearchData();
        data.date.value = '';
        data.mission.value = 'Choose a mission';
        data.camera.value = 'Choose a camera';
        clearErrorMsg();
        document.querySelector("#data").innerHTML = "";

    }
    /**
     * clears the error messages that might appear on the page
     */
    const clearErrorMsg = () =>
    {
        let data = getSearchData();
        data.date.nextElementSibling.innerHTML = '';
        data.date.classList.remove("is-invalid");

        data.mission.nextElementSibling.innerHTML = '';
        data.mission.classList.remove("is-invalid");

        data.camera.nextElementSibling.innerHTML = '';
        data.camera.classList.remove("is-invalid");
    }

    /**
     * extract the date, the mission and the camera given from the user.
     * @returns {{date: HTMLElement, mission: HTMLElement, camera: HTMLElement}}
     */
    const getSearchData = () =>
    {
        return {
            date: document.getElementById("date"),
            mission: document.getElementById("missionSelect"),
            camera: document.getElementById("cameraSelect")
        }
    }
    /**
     * add listeners to the buttons when the DOM content loaded.
     */
    document.addEventListener('DOMContentLoaded', function ()
    {

        document.getElementById("searchBtn").addEventListener('click', searchImages)
        document.getElementById("clearBtn").addEventListener('click', clearSearchData)
        document.getElementById("startSlidShowBtn").addEventListener('click', function ()
        {
            clearErrorMsg();
            if (isThereSlides)
                document.getElementById("carouselSavedImages").classList.remove("d-none");
        });
        document.getElementById("stopSlidShowBtn").addEventListener('click', function ()
        {
            clearErrorMsg();
            document.getElementById("carouselSavedImages").classList.add("d-none");
        });
        document.getElementById("editBtn").addEventListener('click', function ()
        {
            clearErrorMsg();
            let e = document.getElementById("editBtn");
            e.classList.toggle("inEditMode");
            ["btn-outline-primary", "btn-outline-secondary"].map(x => e.classList.toggle(x));
            document.getElementById("clearAllBtn").classList.remove("d-none");
            let delBtns = document.getElementsByClassName("deleteBtn");//add a listener to each button
            for (let d of delBtns)
                d.classList.toggle("d-none");
        });
        document.getElementById("clearAllBtn").addEventListener('click', clearAll)
        getUserImgs();
    })
})();