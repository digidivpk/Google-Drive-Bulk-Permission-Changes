const fields = [
  {
    type:"index",
    name:"index",
    default:0,
    config: {
      md:1,
      xs:1
    }
  },
    {
      name:"include",
      title:"Include",
      type:"select",
      required:false,
      default:"",
      config: {
        md:2,
        xs:2
      },
      options:[
        {
          title: "Include",
          value:"",
          disabled:true
        },{
          title: "Folder",
          value:"folder"
        },{
          title: "File",
          value:"file"
        },{
          title: "Both",
          value:"both"
        }
      ]
    },
    {
      name:"id",
      title:"File or Folder Id",
      type:"text",
      required:false,
      default:"",
      config: {
        md:3,
        xs:3
      }
    },
    {
      name:"role",
      title:"Role",
      type:"select",
      required:false,
      default:"",
      config: {
        md:2,
        xs:2
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
    },
    {
      name:"permission",
      title:"Permission",
      default:"",
      type:"select",
      required:false,
      config: {
        md:2,
        xs:2
      },
      options:[
        {
          title: "Permission",
          value:"",
          disabled:true
        },{
          title: "Domain",
          value:"domain"
        },{
          title: "User",
          value:"user"
        },{
          title: "Anyone",
          value:"anyone"
        }
      ]
    },
    {
      name:"domain",
      title:"Domain",
      type:"text",
      default:"",
      config: {
        md:2,
        xs:2
      }
    },
  ];

  export default fields;