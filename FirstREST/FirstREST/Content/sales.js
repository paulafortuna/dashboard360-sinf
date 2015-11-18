﻿function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function load_sales_by_category() {
    var today = new Date();
    var five_years_ago = new Date(new Date().getFullYear() - 5, 0, 1)

    $.ajax({

        url: 'http://localhost:49822/api/sale',
        type: 'Get',
        data: {
            initialDate: formatDate(five_years_ago),
            finalDate: formatDate(today),
            DocumentType: 'ECL'
        },
        success: function (data) {
            create_sales_by_category(data);
        },
        failure: function () {
            alert('Failed to get sales values');
        }
    });
}

function get_load_sales(initDate, finalDate) {
    var result = "failed";
    $.ajax({
        url: 'http://localhost:49822/api/sale',
        type: 'Get',
        async: false,
        data: {
            initialDate: formatDate(initDate),
            finalDate: formatDate(finalDate),
            DocumentType: 'ECL'

        },
        success: function (data) {
            result = data;
        },
        failure: function () {
            alert('Failed to get sales values');
        }
    });
    return result;
}

function add_net_sales(data) {
    var total = 0;

    if (data == "failed")
        return -1;

    for (var i = 0; i < data.length; i++)
    {
        total += data[i]["Value"]["Value"];
    }
    return total;
}

function create_net_sales() {
    var ctx = $("#net_sales_chart").get(0).getContext("2d");

    var today = new Date();
    var four_years_ago = new Date(new Date().getFullYear() - 4, 0, 1);
    var three_years_ago = new Date(new Date().getFullYear() - 3, 0, 1);
    var two_years_ago = new Date(new Date().getFullYear() - 2, 0, 1);
    var one_year_ago = new Date(new Date().getFullYear() - 1, 0, 1);

    var three_years_ago_value = add_net_sales(get_load_sales(four_years_ago, three_years_ago));
    var two_years_ago_value = three_years_ago_value + add_net_sales(get_load_sales(three_years_ago, two_years_ago));
    var one_year_ago_value = two_years_ago_value + add_net_sales(get_load_sales(two_years_ago, one_year_ago));
    var today_value = one_year_ago_value + add_net_sales(get_load_sales(one_year_ago, today));

    var pie_data = [];
    pie_data[three_years_ago.getFullYear()] = three_years_ago_value;
    pie_data[two_years_ago.getFullYear()] = two_years_ago_value;
    pie_data[one_year_ago.getFullYear()] = one_year_ago_value;
    pie_data[today.getFullYear()] = today_value;

    var data = {
        labels: Object.keys(pie_data),
        datasets: [
            {
                label: "My Second dataset",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [three_years_ago_value, two_years_ago_value, one_year_ago_value, today_value]
            }
        ]
    };

    var options = {
        animation: false,
        responsive: true,
        maintainAspectRatio: true
    };

    var myLineChart = new Chart(ctx).Line(data, options);
}

function create_sales_by_category(data) {
    var ctx = $("#sales_by_category_chart").get(0).getContext("2d");

    var values = [];
    var label = "";
    var value = "";
    $.each(data, function () {
        $.each(this, function (k, v) {
            if (k == "Product")
                label = v["FamilyId"];
            else if (k == "Value")
                value = v["Value"];
        });

        if (label in Object.keys(values)) 
            values[label] += value;
        else 
            values[label] = value;
    });

    var pie_data = [];
    var keys = Object.keys(values);
    var i = 0;
    for (var key in keys) {
        pie_data[i] = {
            value: values[keys[key]],
            color: "#"+((1<<24)*Math.random()|0).toString(16).slice(-6),
            label: keys[key]
        }
        i++;
    }

    var options = {
        animation: false,
        responsive: true,
        maintainAspectRatio: true
    };

    var piechart = new Chart(ctx).Pie(pie_data, options);
}

function load_top_customers() {
    var today = new Date();
    var five_years_ago = new Date(new Date().getFullYear() - 5, 0, 1)

    $.ajax({
        url: 'http://localhost:49822/api/sale',
        type: 'Get',
        data: {
            initialDate: formatDate(five_years_ago),
            finalDate: formatDate(today),
            DocumentType: 'ECL'
        },
        success: function (data) {
            create_top_customers(data);
        },
        failure: function () {
            alert('Failed to get sales values');
        }
    });
}

function create_top_customers(data) {
    var table = $("#top_customers");

    //Table header
    table.append('<thead><tr role="row">').
                        append('<th>ClientId</th><th>ClientName</th><th>Value</th>').
                        append('</tr></thead>');

    //Table body
    table.append('<tbody>');

    //Rows
    var clients = [];
    var value = 0;
    var clientId = "";
    var clientName = "";
    var found = false;
    $.each(data, function () {
        $.each(this, function (k, v) {
            if (k == "ClientId")
                clientId = v;
            else if (k == "ClientName")
                clientName = v;
            else if (k == "Value")
                value = v["Value"];
        });


        found = false;
        for (var i = 0; i < clients.length; i++) {
            //Client in array
            if (clients[i].clientId == clientId) {
                clients[i].value += value;
                found = true;
                break;
            }
        }
        
        //Client not in array
        if (!found)
            clients.push({ clientId: clientId, clientName: clientName, value: value });
    });

    //Sort
    clients.sort(function (a, b) {
        return parseFloat(b.value) - parseFloat(a.value);
    });


    //Add top 10 rows
    for (var i = 0; i < 10 && i < clients.length; i++) {
        table.append('<tr role="row" class="odd"><td>' + clients[i].clientId + '</td><td>' + clients[i].clientName + '</td><td>' + clients[i].value + '</td></tr>');
    }

    //Table end body
    table.append('</tbody>');
}

$(document).ready(ready);

function ready() {
    load_sales_by_category();
    create_net_sales();
    load_top_customers();
}

/*
<table id="top_customers" class="table table-bordered table-hover dataTable" role="grid">
    <thead>
        <tr role="row">
            <th>Rendering engine</th>
            <th class="sorting" tabindex="0" rowspan="1" colspan="1">Browser</th>
            <th class="sorting" tabindex="0" rowspan="1" colspan="1">Platform(s)</th>
            <th class="sorting" tabindex="0" rowspan="1" colspan="1">Engine version</th>
            <th class="sorting" tabindex="0" rowspan="1" colspan="1">CSS grade</th>
        </tr>
    </thead>
    <tbody>
        <tr role="row" class="odd"></tr>
        <tr role="row" class="even"></tr>
        <tr role="row" class="odd"></tr>
        <tr role="row" class="odd"></tr>
        <tr role="row" class="even"></tr>
        <tr role="row" class="odd"></tr>
        <tr role="row" class="odd"></tr>
        <tr role="row" class="even"></tr>
        <tr role="row" class="odd"></tr>
        <tr role="row" class="even"></tr>
    </tbody>
</table>
*/