/////////////////////////////////////////////
//////////////// All Nodes //////////////////
/////////////////////////////////////////////

class AllNodes {
    constructor() {
        this.all_nodes = {};
        this.supporting_mycontroller_urls = [];
        this.nodes_with_promise = [];
    }
    add_node_if_not_exists(node) {
        if (!this.hasNode(node.name)){
            this.all_nodes[node.name] =  node;
            return true; 
        }
        return false; 
    }
    hasNode(name){
        return hasKey(this.all_nodes, name);
    }
    getNode(name){
        return this.all_nodes[name];
    }
    getAllNodes(){
        return this.all_nodes;
    }
    getNodesByGroup(group){
        var nodes = [];
        for (var n_idx in this.all_nodes){
            if (this.all_nodes[n_idx].group == group){
                nodes.push(this.all_nodes[n_idx]);
            }
        }
        return nodes; 
    }
    getNodesByMudURL(url){
        var nodes = [];
        for (var n_idx in this.all_nodes){
            if (this.all_nodes[n_idx].get_mud_url() == url){
                nodes.push(this.all_nodes[n_idx]);
            }
        }
        return nodes; 
    }
    getNodesByMiscKeyValue(key,value){
        var nodes = [];
        for (var n_idx in this.all_nodes){
            if (this.all_nodes[n_idx].get_misc_data(key) == value){
                nodes.push(this.all_nodes[n_idx]);
            }
        }
        return nodes; 
    }
    get_controller_by_mud_url(mud_url){
        for (var n_idx in this.all_nodes){
            if (this.all_nodes[n_idx].is_mycontroller_node() && this.all_nodes[n_idx].get_misc_data('supported_mud_urls').indexOf(mud_url) != -1){
                return this.all_nodes[n_idx];
            }
        }
    }
    has_mycontroller_supporting_url(mud_url){
        return this.supporting_mycontroller_urls.indexOf(mud_url) != -1;
    }
    add_supporting_my_controller_url(mud_url){
        this.supporting_mycontroller_urls.push(mud_url);
    }
    add_to_nodes_with_awaiting_promise(node_name){
        concat_if_not_exists(this.nodes_with_promise, node_name);
    }
    has_awaiting_promises(){
        return this.nodes_with_promise.length > 0 ;
    }
    pop_node_with_awaiting_promise(){
        return this.nodes_with_promise.pop();
    }
}

/////////////////////////////////////////////
//////////////// All Links //////////////////
/////////////////////////////////////////////

class AllLinks {
    constructor() {
        this.all_links = {};
    }
    add_link_if_not_exists(link) {
        if (!this.hasLink(link)){
            this.all_links[link.uid] = link ;
            return true;
        }
        return false; 
    }
    hasLink(link){
        return hasKey(this.all_links, link.uid);
    }
    getLink(link){
        return this.all_links[link.uid];
    }
    getLink_by_uid(uid){
        return this.all_links[uid];
    }
    create_uid(source,target){
        return source + '->' + target;
    }
}

/////////////////////////////////////////////
//////////////// NODE ///////////////////////
/////////////////////////////////////////////

class Node {
    constructor(group, name) {
        this.group = group;
        this.id = name;
        this.name = name;
        this.manufacturer; 
        // this.other_manufacturers; 
        this.is_mycontroller = false;
        this.promise;
        this.controller_exists = false; 
        this.incoming = {
            'devices': [this.name], // indicates which nodes has relation with this node on incoming traffic
            'links': [],
            "Abstractions": new Abstractions(),
            "promises": []
        };
        this.outgoing = {
            'devices': [this.name], // indicates which nodes has relation with this node on outgoing traffic
            "links": [],
            "Abstractions": new Abstractions(),
            "promises": []
        };
        this.misc_data = [];
    }
    add_device_if_not_exists(traffic_direction, device) {
        concat_if_not_exists( this[traffic_direction].devices, device);
    }
    add_link_if_not_exists(traffic_direction, link) {
        concat_if_not_exists(this[traffic_direction].links, link.uid);
        concat_if_not_exists(this[traffic_direction].devices, link.source);
        concat_if_not_exists(this[traffic_direction].devices, link.target);
    }
    add_protocol(traffic_direction, abstraction, protocol){
        if (abstraction == 'domain-names' && protocol.target == null){
            console.error("protocol does not have a target");
        }
        this[traffic_direction].Abstractions.add_protocol(abstraction,protocol);
    }

    set_manufacturer(manufacturer){
        this.manufacturer = manufacturer;
    }
    set_target_and_save_protocol(traffic_direction,inp_abstraction, inp_protocol, target){
        var tmp_protocol = new Protocol();
        tmp_protocol.copy_from(inp_protocol); 
        tmp_protocol.setTarget(target);
        this.add_protocol(traffic_direction, inp_abstraction, tmp_protocol);
    }
    set_controller_exists_flag(){
        this.controller_exists = true; 
    }
    get_controller_exists_flag(){
        return this.controller_exists; 
    }
    get_devices(traffic_direction) {
        return this[traffic_direction].devices;
    }
    get_links(traffic_direction) {
        return this[traffic_direction].links;
    }
    get_protocols(traffic_direction){
        return this[traffic_direction].Abstractions.get_all_protocols();
    }
    get_protocols_by_abstraction(traffic_direction,abstraction){
        return this[traffic_direction].Abstractions.get_protocol_by_abstraction(abstraction);
    }
    get_group1_devices(traffic_direction){
        var group1_device_names = [];
        for (var dev_idx in this[traffic_direction].devices){
            var current_device_name = this[traffic_direction].devices[dev_idx];
            if (allNodesObj.getNode(current_device_name).group == "1"){
                group1_device_names.push(current_device_name);
            }
        }
        return group1_device_names;
    }
    set_promise(promise){
        this.promises = promise;
    }
    get_promise(){
        return this.promises;
    }
    add_directional_promise(traffic_direction, promise){
        this[traffic_direction].promises.push(promise);
    }
    get_directional_promise(traffic_direction, promise){
        return this[traffic_direction].promises.push(promise);
    }
    set_mud_url(url){
        this.mud_url = url ;
    }
    get_mud_url(){
        return this.mud_url;
    }
    add_misc_data(key,value){
        this.misc_data[key] = value ; 
    }
    get_misc_data(key){
        return this.misc_data[key];
    }
    add_to_supported_mud_urls(mud_url){
        this.misc_data['supported_mud_urls'].push(mud_url);
        allNodesObj.add_supporting_my_controller_url(mud_url);
    }
    mark_as_my_controller(){
        this.is_mycontroller = true;
        this.misc_data['supported_mud_urls'] = [];
    }
    is_mycontroller_node(){
        return this.is_mycontroller == true ; 
    }
}

/////////////////////////////////////////////
//////////////// link ///////////////////////
/////////////////////////////////////////////

class Link {
    constructor(source, target) {
        this.source = source;
        this.target = target;
        this.uid = this.get_uid();
        this.incoming = { 
            'device:flow': [] , // in this format: {name: flow_direction } where flow_direction is normal or reverse
            "Abstractions": new Abstractions()
        };
        this.outgoing = { 
            'device:flow': [] ,
            "Abstractions": new Abstractions()
        };
    }
    add_deviceflow_if_not_exists(traffic_direction, device_flow) {
        if (typeof(device) == "string"){
            console.error("the device:flow should be an object device:flowdirection")
        }
        concat_if_not_exists(this[traffic_direction]['device:flow'], device_flow);
    }
    get_deviceflows(traffic_direction) {
        return this[traffic_direction]['device:flow'];
    }
    get_uid(){
        return this.source + '->' + this.target;
    }
}

/////////////////////////////////////////////
//////////////// Protocol ///////////////////
/////////////////////////////////////////////

class Protocol {
    constructor(transport, network, src_port, dst_port) {
        transport ? this.transport = transport : this.transport = "any";
        network ? this.network = network : this.network = "any";
        !src_port || src_port.length == 0 ? this.src_port = "any" : this.src_port = src_port ;
        !dst_port || dst_port.length == 0 ? this.dst_port = "any" : this.dst_port = dst_port ;
        
    }
    toObject() {
        return { "transport": this.transport, "network": this.network, "src_port": this.src_port, "dst_port": this.dst_port };
    }
    setTarget(target) {
        this.target = target; 
    }
    set_other_manufacturers(other_manufacturers){
        this.other_manufacturers = other_manufacturers;
    }
    matches_manufacturer(manufacturer){
        if (this.other_manufacturers == manufacturer){
            return true;
        }
        return false; 
    }
    copy_from(protocol){
        this.transport = protocol.transport;
        this.network = protocol.network;
        this.src_port = protocol.src_port;
        this.dst_port = protocol.dst_port;
    }
}


/////////////////////////////////////////////
//////////////// ProtocolSet ////////////////
/////////////////////////////////////////////

class ProtocolSet {
    constructor() {
        this.protocols = [];
    }
    merge_or_append(new_protocol) {
        var close_match_found = false;
        for (var pr_idx in this.protocols) {
            var tmp_protocol = this.protocols[pr_idx];
            
            // check if an exact copy exists
            if (tmp_protocol.target == new_protocol.target && 
                tmp_protocol.transport == new_protocol.transport &&
                tmp_protocol.network == new_protocol.network &&
                tmp_protocol.src_port[0] == new_protocol.src_port[0] && // in case of "any" "a" would be the same
                tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) {

                close_match_found = true;
                break;
            }

            // the next four if statements are to check if the new protocol is superset of any of the current protocls, if so update that instead of adding a new one
            if (
                tmp_protocol.target == new_protocol.target && 
                new_protocol.transport == 'any' &&
                tmp_protocol.network == new_protocol.network &&
                tmp_protocol.src_port[0] == new_protocol.src_port[0] &&
                tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) {

                tmp_protocol.transport = 'any';
                close_match_found = true;
                break;
            }
            if (tmp_protocol.target == new_protocol.target && 
                tmp_protocol.transport == new_protocol.transport &&
                new_protocol.network == 'any' &&
                tmp_protocol.src_port[0] == new_protocol.src_port[0] &&
                tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) {

                tmp_protocol.network = 'any';
                close_match_found = true;
                break;
            }
            if (tmp_protocol.target == new_protocol.target && 
                tmp_protocol.transport == new_protocol.transport &&
                tmp_protocol.network == new_protocol.network &&
                new_protocol.src_port == 'any' &&
                tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) {

                tmp_protocol.src_port = 'any';
                close_match_found = true;
                break;
            }
            if (tmp_protocol.target == new_protocol.target && 
                tmp_protocol.transport == new_protocol.transport &&
                tmp_protocol.network == new_protocol.network &&
                tmp_protocol.src_port[0] == new_protocol.src_port[0] &&
                new_protocol.dst_port == 'any') {
                    
                tmp_protocol.transport = 'any';
                close_match_found = true;
                break;
            }
            // the next if statements are to check if any of the current protocols is a superset of the new protocol. if so don't bother add the new one
            if (( tmp_protocol.target == new_protocol.target &&  tmp_protocol.transport == 'any' && tmp_protocol.network == new_protocol.network && tmp_protocol.src_port[0] == new_protocol.src_port[0] && tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) ||
                ( tmp_protocol.target == new_protocol.target &&  tmp_protocol.transport == new_protocol.transport && tmp_protocol.network == 'any' && tmp_protocol.src_port[0] == new_protocol.src_port[0] && tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) ||
                ( tmp_protocol.target == new_protocol.target &&  tmp_protocol.transport == new_protocol.transport && tmp_protocol.network == new_protocol.network && tmp_protocol.src_port == 'any' && tmp_protocol.dst_port[0] == new_protocol.dst_port[0]) ||
                ( tmp_protocol.target == new_protocol.target && tmp_protocol.transport == new_protocol.transport && tmp_protocol.network == new_protocol.network && tmp_protocol.src_port[0] == new_protocol.src_port[0] && tmp_protocol.dst_port == 'any')) {
                close_match_found = true;
                break;
            }
        }
        if (!close_match_found) {
            this.protocols.push(new_protocol);
        }
    }
    get_protocols(){
        return this.protocols;
    }
}
/////////////////////////////////////////////
//////////////// Abstractions ////////////////
/////////////////////////////////////////////

class Abstractions {
    constructor() {
        this.domain_protocols = new ProtocolSet();
        this.localnetworks_protocols = new ProtocolSet();
        this.samemanufacturer_protocols = new ProtocolSet();
        this.manufacturer_protocols = new ProtocolSet();
        this.mycontroller_protocols = new ProtocolSet();
        this.controller_protocols = new ProtocolSet();
        this.samemodel_protocols = new ProtocolSet();
        this.all_protocols = [];
    }
    add_protocol(abstraction, protocol) {
        switch (abstraction) {
            case "domain-names":
                this.domain_protocols.merge_or_append(protocol);
                break;
            case "local-networks":
                this.localnetworks_protocols.merge_or_append(protocol);
                break;
            case "same-manufacturer":
                this.samemanufacturer_protocols.merge_or_append(protocol);
                break;
            case "manufacturer":
                this.manufacturer_protocols.merge_or_append(protocol);
                break;
            case "my-controller":
                this.mycontroller_protocols.merge_or_append(protocol);
                break;
            case "controller":
                this.controller_protocols.merge_or_append(protocol);
                break
            case "same-model":
                this.samemodel_protocols.merge_or_append(protocol);
                break;
        }
    }
    get_protocol_by_abstraction(abstraction){
        switch (abstraction) {
            case "domain-names":
                return this.domain_protocols.get_protocols();
            case "local-networks":
                return this.localnetworks_protocols.get_protocols();
            case "same-manufacturer":
                return this.samemanufacturer_protocols.get_protocols();
            case "manufacturer":
                return this.manufacturer_protocols.get_protocols();
            case "my-controller":
                return this.mycontroller_protocols.get_protocols();
            case "controller":
                return this.controller_protocols.get_protocols();
            case "same-model":
                return this.samemodel_protocols.get_protocols();
        }
    }

    get_all_protocols(){
        this.all_protocols = this.all_protocols.concat(this.domain_protocols.get_protocols());
        this.all_protocols = this.all_protocols.concat(this.localnetworks_protocols.get_protocols());
        this.all_protocols = this.all_protocols.concat(this.samemanufacturer_protocols.get_protocols());
        this.all_protocols = this.all_protocols.concat(this.manufacturer_protocols.get_protocols());
        this.all_protocols = this.all_protocols.concat(this.mycontroller_protocols.get_protocols());
        this.all_protocols = this.all_protocols.concat(this.controller_protocols.get_protocols());
        this.all_protocols = this.all_protocols.concat(this.samemodel_protocols.get_protocols());
        
        var all_protocols_pruned = []; // this will prune all protocols: cases like 
                                    // {transport: any, protocol: ipv4, src_port: any, dst_prot: any, target: "iot"} and 
                                    // {transport: TCP, protocol: ipv4, src_port: 888, dst_prot: 777, target: "iot"} should be merged to the former
        var targets = this.get_targets(); 
        for (var tar_idx in targets){
            var current_target = targets[tar_idx];
            var target_protocols = this.get_protocols_by_target (current_target) ; 
            var transport = find_values_by_key(target_protocols,'transport');
            transport.indexOf('any') != -1 ? transport = ['any'] : transport = [...new Set(transport)];
            var network = find_values_by_key(target_protocols,'network');
            network.indexOf('any') != -1 ? network = ['any'] : network = [...new Set(network)];
            var src_port = find_values_by_key(target_protocols,'src_port');
            src_port.indexOf('any') != -1 ? src_port = ['any'] : src_port = [...new Set(src_port)];
            var dst_port = find_values_by_key(target_protocols,'dst_port');
            dst_port.indexOf('any') != -1 ? dst_port = ['any'] : dst_port = [...new Set(dst_port)];

            var tmp_protocol = new Protocol(transport, network, src_port, dst_port);
            tmp_protocol.setTarget(current_target);
            all_protocols_pruned.push(tmp_protocol);
        }
        return all_protocols_pruned; 
    }

    get_protocols_by_target (target){
        return this.all_protocols.filter(prtc => prtc.target == target); 
    }

    get_targets(){
        return [... new Set(find_values_by_key(this.all_protocols, 'target'))];
    }
    // matched_protocols = matched_protocols.filter(prtc => prtc.matches_manufacturer(first_node.manufacturer));

}


///////////////////////////////////////
////////////// AcePromise /////////////
///////////////////////////////////////

class AcePromise {
    constructor(type) {
        this.type = type; 
        this.data = {}
        switch (type){
            case "my-controller":
                this.data['my-controller-name'] = null;
                this.data['my-controller-IP-address'] = null; 
        }
        
    }

    get_data_length(){
        return Object.keys(this.data).length; 
    }

    isfulfilled() {
        if (Object.keys(this.data).indexOf(null) != -1) {
            return false;
        }
        return true;
    }

    get_type() {
        return this.type; 
    }

    set_value_by_key(key,value){
        this.data[key] = value ; 
    }

    get_titles(){
        return Object.keys(this.data);
    }

    get_value_by_key(key){
        return this.data[key];
    }

}

