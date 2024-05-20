import {
	ChevronRightIcon,
} from '@heroicons/react/solid'

import {
	EyeIcon,
} from '@heroicons/react/outline'



const obj = {

	title: "LinkedIn Posts",
	desc: "Inspiring LinkedIn posts that will help you build trust and authority in your industry.",
	category: "Social",
	Icon: EyeIcon,
	// tags: [],
	permissions: ['user'],
	
	fromColor: "blue-600",
	toColor: "yellow-500",


	to: "/ai/social/linkedin_posts",
	api: "/ai/social/linkedin_posts",

	output: {
		title: "Generated Result",
		desc: "",
		Icon: ChevronRightIcon,
		color: "gray",
	},

	prompts: [{
		title:"LinkedIn Posts",
		desc: "Inspiring LinkedIn posts that will help you build trust and authority in your industry.",
		// n: 1,
		prompts: [
			{
				title: "Topic *",
				attr:"topic",
				value:"",
				placeholder:"",		
				maxLength: 200,
				type: "textarea",
				// max: 100,
				min: 3,
				required: true,
				error: "",
				example: "Hello World ",
			},
			{
				title: "Language",
				attr: "language",
				value: "English",
				options:[
					{"value": "English", "label": "English"},
					{"value": "Arabic", "label": "Arabic"},
					{"value": "Bengali", "label": "Bengali"},
					{"value": "Chinese", "label": "Chinese"},
					{"value": "Danish", "label": "Danish"},
					{"value": "Dutch", "label": "Dutch"},						
					{"value": "French", "label": "French"},
					{"value": "German", "label": "German"},
					{"value": "Hebrew", "label": "Hebrew"},
					{"value": "Hindi", "label": "Hindi"},
					{"value": "Indonesian", "label": "Indonesian"},		
					{"value": "Italian", "label": "Italian"},	
					{"value": "Japanese", "label": "Japanese"},	
					{"value": "Polish", "label": "Polish"},	
					{"value": "Romanian", "label": "Romanian"},	
					{"value": "Russian", "label": "Russian"},	
					{"value": "Spanish", "label": "Spanish"},	
					{"value": "Swedish", "label": "Swedish"},	
					{"value": "Turkish", "label": "Turkish"},	
					{"value": "Vietnamese", "label": "Vietnamese"},	
					{"value": "Bangla", "label": "Bangla"},
				],
				type:"dropdown",
			},
			{
				title: "Quality type",
				attr: "quality",
				value: "Economy",
				options:[
					{"value": "Economy", "label": "Economy"},
					{"value": "Average", "label": "Average"},
					{"value": "Good", "label": "Good"},
					{"value": "Premium", "label": "Premium"},			
				],
				type:"dropdown",
			},
			{
				title: "Tone of Voice",
				attr: "voice",
				value: "Funny",
				options:[
					{"value": "Funny", "label": "Funny"},
					{"value": "Casual", "label": "Casual"},
					{"value": "Excited", "label": "Excited"},
					{"value": "Professional", "label": "Professional"},	
					{"value": "Witty", "label": "Witty"},
					{"value": "Sarcastic", "label": "Sarcastic"},
					{"value": "Feminine", "label": "Feminine"},
					{"value": "Masculine", "label": "Masculine"},
					{"value": "Bold", "label": "Bold"},
					{"value": "Dramatic", "label": "Dramatic"},
					{"value": "Gumpy", "label": "Gumpy"},
					{"value": "Secretive", "label": "Secretive"},		
				],
				type:"dropdown",
			},
			{
				title: "Number of Results",
				attr:"result",
				value:"1",
				options:[
					{"value": 1, "label": "1"},
					{"value": 2, "label": "2"},
					{"value": 3, "label": "3"},
					{"value": 4, "label": "4"},	
					{"value": 5, "label": "5"}		
				],
				type:"dropdown",
			},
			{
				title: "Max Results Length", 
				attr: "length",  
				value: "500", 
				placeholder: "500", 
				label: "Who the main group are you are writing for",
				// type: "textarea",
				maxLength: 10,
				// max: 100,
				// min: 5,
				// required: true,
				error: "",
				example: "",
			},
			// options: [{ title: "2nd Grader", value: "2nd Grader", desc: "Explain this like I'm 5 years old", Icon: AnnotationIcon },],
				
		],
		example: {
			output: ``,
			outputs: [
				"The code above is a function definition.",
				"It defines a new function called `HelloWorld` that takes a single argument called `text`",
				"The body of the function is a single line of code that prints out the value of `text` if it is defined, or `Hello World` if it is not defined."
			],
			// Icon: TerminalIcon,
			// color: "gray",
		}
	}]
		
}

export default obj

