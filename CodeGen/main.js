var in_ta = $('#input');
var out_ta = $('#output');
var btn = $('#btn');
var select = $('#select');
var btn_convert = $('#btn_convert');
var in_model = $('#input_model');
var in_DO = $('#input_DO');
var out_convert = $('#output_convertor');

var keyword = ["continue", "for", "new", "switch", "assert", "default", "package", "synchronized", "boolean", "do", "if", "private", "this", "break", "double", "implements", "protected", "throw", "byte", "else", "import", "public", "throws", "case", "enum", "instanceof", "return", "transient", "catch", "extends", "int", "short", "try", "char", "final", "interface", "static", "void", "class", "finally", "long", "volatile", "float", "native", "super", "while", "abstract"]

var modifiers = ["public", "private", "protected", "static", "final", "native", "synchronized", "abstract", "transient"];
var base_type = ['int', 'boolean', 'long', 'byte', 'char', 'short', 'float', 'double',
	'Interge', 'Boolean', 'Long', 'Character', 'Short', 'Float', 'Double', 'Byte', 'String'
];
String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};
String.prototype.upperFirst = function() {
	return this[0].toUpperCase() + this.substring(1);
};
String.prototype.lowerFirst = function() {
	return this[0].toLowerCase() + this.substring(1);
};
Array.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};

function* next_char(input) {
	for(var i = 0; i < input.length; i++) {
		yield input[i];
	}
}

function* next_token(input) {
	var i = 0;
	var gen = next_char(input);
	var ch;
	var token = [];
	while((ch = gen.next()).done === false) {
		switch(ch.value) {
			case '<':
				token.push(ch.value);
				var stack = [];
				stack.push('<');
				while(stack.length > 0) {
					var t = gen.next().value;
					if(t === '<') {
						stack.push('<');
					} else if(t === '>') {
						stack.pop()
					}
					token.push(t);
				}
				yield token.join('');
				token.length = 0;
			case ' ':
			case '\t':
			case '\n':
				if(token.length > 0) {
					yield token.join('');
					token.length = 0; //清空数组
				}
				break;
			case ';':
			case ',':
			case '(':
			case ')':
			case '=':
			case '{':
			case '}':
				if(token.length > 0) {
					yield token.join('');
					token.length = 0;
				}
				yield ch.value;
				break;
			case '"':
				token.push(ch.value);
				while((ch = gen.next()).value != '"') {
					token.push(ch.value);
				}
				token.push(ch.value);
				break;
			case '/':
				ch = gen.next();
				switch(ch.value) {
					case '/':
						while(gen.next().value != '\n');
						break;
					case '*':
						while(gen.next().value != '/');
						break;
					default:
						break;
				}
				break;
			default:
				token.push(ch.value);
				break;
		}
	}
}

function gen_class(source) {
	var token = next_token(source);
	var arr = [];
	var clazz = {
		name: '',
		varName: '',
		properties: [],
		methods: []
	};
	var t;
	//跳过前面的token
	while(token.next().value != 'class');
	clazz.name = token.next().value;
	clazz.varName = clazz.name.lowerFirst();

	while(token.next().value != '{');

	function Field() {
		this.type = '';
		this.name = '';
		this.modifier = [];
	}
	var skipp = () => {
		while(token.next().value != '{');
		while(token.next().value != '}');
	}
	while((t = token.next().value) != '}') {
		var temp = new Field();
		//找到第一个修饰符
		while(!modifiers.contains(t)) {
			t = token.next().value;
		}
		//保存修饰符
		while(modifiers.contains(t)) {
			temp.modifier.push(t);
			t = token.next().value;
		}
		//跳过内部类
		if(t === 'class') {
			skipp();
			continue;
		}
		//跳过构造方法
		if(t === clazz.name) {
			skipp();
			continue;
		}
		temp.type = t;
		temp.name = token.next().value;
		//跳过方法体
		t = token.next().value;
		if(t === '(') {
			skipp();
			clazz.methods.push(temp);
		} else {
			while(t != ';') {
				t = token.next().value;
			}
			clazz.properties.push(temp);
		}
	}
	console.log(clazz);
	return clazz;
};

var block = ' {\n\n    }\n\n';

function junit3(input) {
	var clazz = gen_class(input);
	var output = [];
	output.push(`public class ${clazz.name}Test extends TestCase {\n\n`);
	output.push(`    protected void setUp()${block}`);
	output.push(`    protected void tearDown()${block}`);

	clazz.methods.forEach(function(e) {
		if(e.modifier.contains('public') && !e.name.startsWith('set') && !e.name.startsWith('get')) {
			var name = e.name.upperFirst();
			output.push(`    public void test${name}()${block}`)
		}
	});
	output.push('}')
	return output.join('');
}

function juint4(input) {
	var clazz = gen_class(input);
	var output = [];

	output.push(`public class ${clazz.name}Test {\n\n`);
	output.push(`    @Before\n    public void setUp()${block}`);
	output.push(`    @After\n     public void tearDown()${block}`);

	clazz.methods.forEach(function(e) {
		if(e.modifier.contains('public') && !e.name.startsWith('set') && !e.name.startsWith('get')) {
			var name = e.name.upperFirst();
			output.push(`    @Test\n    public void test${name}()${block}`)
		}
	});
	output.push('}')
	return output.join('');
}

function mock(input) {
	var clazz = gen_class(input);
	var output = [];

	output.push(`public class ${clazz.name}Test {\n\n`);
	output.push(`    private ${clazz.name} ${clazz.varName};\n\n`);

	clazz.properties.forEach(function(e) {
		if(e.modifier.contains('private') && !base_type.contains(e.type)) {
			output.push(`    @Mock\n    private ${e.type} ${e.name};\n\n`);
		}
	});

	output.push(`    @Before\n    public void setUp() {
            ${clazz.name.lowerFirst()} = new ${clazz.name}();
            MockitoAnnotations.initMocks(this);\n    }\n\n`);
	output.push(`    @After\n     public void tearDown()${block}`);

	clazz.methods.forEach(function(e) {
		if(e.modifier.contains('public') && !e.name.startsWith('set') && !e.name.startsWith('get')) {
			var name = e.name.upperFirst();
			output.push(`    @Test\n    public void test${name}()${block}`)
		}
	});
	output.push('}')
	return output.join('');

}

function go_getter(input) {
	var struct = gen_struct(input);
	var output = [];

	struct.fields.forEach(function(e) {
		output.push(`func (self *${struct.name}) ${e.name.upperFirst()}() ${e.type} {\n\treturn self.${e.name}\n}\n\n`)
	})
	return output.join('');
}

function gen_struct(input) {
	var token = next_token(input)
	var struct = {
		name: "",
		fields: []
	}

	function Field() {
		this.type = '';
		this.name = '';
	}
	while((t = token.next()).done === false) {
		switch(t.value) {
			case 'type':
				struct.name = token.next().value
				break;
			case 'struct':
				break;
			case '{':
				break;
			case '}':
				return struct;
			default:
				var tmp = new Field();
				tmp.name = t.value;
				tmp.type = token.next().value;
				struct.fields.push(tmp);
				break;
		}
	}
	return struct;
}

function token(input) {
	var gen = next_token(input);
	var token = [];
	var t;
	while((t = gen.next()).done != true) {
		token.push(t.value);
	}
	return token.join('\n');
}

function gen_convertor(input_model, input_DO) {
	var model = gen_class(input_model);
	var DO = gen_class(input_DO);
	var output = [];

	output.push(`public class ${model.name}Convertor {\n`);
	output.push(`	/**\n	 * 将${DO.name}转换为${model.name}\n     * @param ${DO.varName}\n     * @return\n     */\n`);
	output.push(`    public static ${model.name} convertTo${model.name}(${DO.name} ${DO.varName}) {\n`);
	output.push(`		if(${DO.varName} == null) {\n`);
	output.push(`			return null;\n`);
	output.push(`		}\n`);
	output.push(`		${model.name} ${model.varName} = new ${model.name}();\n\n`);
	model.properties.forEach(function(e) {
		if(e.modifier.contains('private') && e.modifier.length == 1) {
			output.push(`    	${model.varName}.set${e.name.upperFirst()}(${DO.varName}.get${e.name.upperFirst()}());\n`);
		}
	});
	output.push(`		return ${model.varName};\n`);
	output.push(`	}\n\n`);

	output.push(`	/**\n	 * 将${model.name}转换为${DO.name}\n     * @param ${model.varName}\n     * @return\n     */\n`);
	output.push(`    public static ${DO.name} convertTo${DO.name}(${model.name} ${model.varName}) {\n`);
	output.push(`		if(${model.varName} == null) {\n`);
	output.push(`			return null;\n`);
	output.push(`		}\n`);
	output.push(`		${DO.name} ${DO.varName} = new ${DO.name}();\n\n`);
	DO.properties.forEach(function(e) {
		if(e.modifier.contains('private')) {
			output.push(`    	${DO.varName}.set${e.name.upperFirst()}(${model.varName}.get${e.name.upperFirst()});\n`);
		}
	});
	output.push(`		return ${DO.varName};\n`);
	output.push(`	}\n\n`);
	output.push(`}`);
	return output.join('');
}

$(document).ready(function() {
	btn_convert.on('click', () => {
		out_convert.val(gen_convertor(in_model.val(), in_DO.val()));
	})

	btn.on('click', () => {
		var run = (process) => {
			out_ta.val(process(in_ta.val()));
		}
		switch(select.val()) {
			case 'junit3':
				run(junit3);
				break;
			case 'juint4':
				run(juint4);
				break;
			case 'mock':
				run(mock);
				break;
			case 'token':
				run(token);
				break;
			case 'go_getter':
				run(go_getter);
				break;
		}
	});
});