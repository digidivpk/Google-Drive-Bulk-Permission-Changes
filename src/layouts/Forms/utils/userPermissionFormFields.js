const fields = [
    {
        name:"emailAddress",
        title:"Email Address",
        type:"text",
        required:false,
        default:"",
        config: {
            md:5,
            xs:5
        },
    },
    {
        name:"role",
        title:"Role",
        type:"select",
        required:false,
        default:"",
        config: {
            md:5,
            xs:5
        },
        options:[
            {
                title: "Role",
                value:"",
                disabled:true
            },{
                title: "Reader",
                value:"reader"
            },{
                title: "Writer",
                value:"writer"
            }
        ]
    }
];

export default fields;