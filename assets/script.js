
const cal_colors = [
  '#2E8A8A', // electric teal
  '#9A2E5F', // neon rose
  '#3F3B6B', // deep indigo
  '#8A8F2E', // neon olive
  '#5C2D2D', // deep red clay
  '#2D4F6B', // steel blue
  '#9A5A2E', // neon copper
  '#2F6B3F', // forest green
  '#7A2E9A', // neon purple
  '#6B4F1D', // dark amber
  '#4A4A4A', // graphite neutral
  '#2E5F8A'  // neon steel blue
];


let cal_current_year = new Date().getFullYear();
async function generate_calendar(container_id, list_con_id) {

  const cal_data = await get_data (cal_current_year) ;
  const current_day = new Date();
  const currentYear = new Date().getFullYear();

  initCalendarStyles(container_id);
const calendarDataSource = cal_data.map((item) => {
  const date = new Date(item.eventdate);
  const monthIndex = date.getMonth(); // 0 = Jan, 11 = Dec
  return {
    id: item.id,
    name: item.event,
    startDate: date,
    endDate: date,
    color: cal_colors[monthIndex]
  };
});

  new Calendar(container_id, {
    enableRangeSelection: true,
    dataSource: calendarDataSource,
    mouseOnDay: function (e) {
      if (e.events.length > 0) {
        let content = '';
        $(e.element).popover('dispose');

        for (let i in e.events) {
          const formattedDate = e.events[i].startDate.toLocaleDateString(
            undefined,
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
          );

          content += `
        <div class="event-tooltip-content">
          <div id="cal_pop_${e.events[i].id}">
            <b style="font-size:1.4em">●</b>
            <em class="text-black">${e.events[i].name}</em>
            <small class="text-black-50"> ( ${formattedDate} )</small>
          </div>
        </div>
      `;
        }

        $(e.element).popover({
          trigger: 'manual',
          container: 'body',
          html: true,
          content: content,
        });

        $(e.element).popover('show');

        for (let i in e.events) {
          $('#cal_pop_' + e.events[i].id).css(
            'color',
            e.events[i].color || '#000',
          );
        }
      }
    },
    mouseOutDay: function (e) {
      if (e.events.length > 0) {
        $(e.element).popover('hide');
      }
    },
    allowOverlap: true,
    customDayRenderer: function (cellContent, currentDate) {
      if (
        current_day.getFullYear() === currentDate.getFullYear() &&
        current_day.getMonth() === currentDate.getMonth() &&
        current_day.getDate() === currentDate.getDate()
      ) {
        cellContent.classList.add('font-weight-bold');
        cellContent.classList.add('text-black');
        //cellContent.classList.add("py-auto");
        cellContent.classList.add('m-1');
        cellContent.classList.add('border');
        cellContent.classList.add('border-secondary');
      } else {
        //cellContent.classList.add("py-auto");
        cellContent.classList.add('m-1');
      }
    },
  });

  document
    .querySelector('.calendar')
    .addEventListener('yearChanged', function (e) {
      cal_current_year = e.currentYear;

      populate_callist(cal_data, list_con_id, cal_current_year);

      // rebind after DOM rebuild
      setTimeout(() => {
        hover_cal_month(cal_data, container_id, list_con_id, cal_current_year);
        color_day_modifier(container_id, '#b273b2', '#ff0000');
      }, 50);
    });

  populate_callist(cal_data, list_con_id, cal_current_year);
  setTimeout(() => {
    hover_cal_month(cal_data, container_id, list_con_id, cal_current_year);
    color_day_modifier(container_id, '#b273b2', '#ff0000');
  }, 50);
}
function initCalendarStyles(containerId) {
  // Normalize selector
  if (!containerId.startsWith('#') && !containerId.startsWith('.')) {
    containerId = `#${containerId}`;
  }

  const styleId = `calendar-style-${containerId.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;

  style.textContent = `
    ${containerId} .calendar {
      padding: 0 !important;
      font-family: 'Inter', sans-serif;
      
    }

    .calendar .calendar-header {
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: none;
      color: #111;
      position: sticky !important;
      top: 0;
      z-index: 50;
      margin: 0 !important;
      padding: 2px 6px;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }


    .calendar .calendar-header .year-title {
      font-size: 1.2em !important;
      font-weight: 600;
      color: #111;
      padding: 6px 14px;
      border-radius: 6px;
    }


     .calendar .calendar-header 
    .year-title:not(.year-neighbor):not(.year-neighbor2) {
      border-bottom: 2px solid #495153;
    }

     .calendar .months-container .month-container {
      height: auto;
      margin-bottom: 1px;
    }

     .calendar table.month {
      height: auto;
    }

    .calendar table.month th.month-title {
      color: rgba(0,0,0,.589);
      padding: 2px;
      font-weight: 700;
      font-size: 1.1em !important;
    }

    .calendar table.month th.day-header {
      padding-top: 10px;
      color: rgba(32,32,32,.884);
      font-weight: 400;
      font-size: 1em !important;
    }

     .calendar table.month td.day .day-content {
      padding: 2px 4.5px;
      border-radius: 50%;
      color: rgba(32,32,32,.884);
      font-weight: 250;
      font-size: 1.2em !important;
    }
  `;

  document.head.appendChild(style);
}

function populate_callist(data_val, containerSelector, year, monthName = null) {
  const $container = $(containerSelector);
  $container.empty(); // purge old reality

  const filteredData = data_val.filter((item) => {
    const d = moment(item.eventdate);

    const matchYear = year ? d.year() === parseInt(year) : true;
    const matchMonth = monthName ? d.format('MMMM') === monthName : true;

    return matchYear && matchMonth;
  });

 filteredData.forEach((item) => {
  const eventDate = moment(item.eventdate);
  const day = eventDate.format('DD');
  const month = eventDate.format('MMM').toUpperCase();
  const year = eventDate.format('YYYY');
  const monthIndex = eventDate.month(); // 0 = Jan, 11 = Dec
  const $li = $(`
    <div class="list-group-item event-item d-flex align-items-start justify-content-between border-0"
         style="
           padding:4px 8px;
           min-height:42px;
           line-height:1.15;
           margin-bottom: 1px;
           box-shadow: 0 6px 6px -4px rgba(0,0,0,0.10);
           background:#fff;
         ">
      
      <!-- Day -->
      <div style="color: ${cal_colors[monthIndex]};font-size:1.1em; font-weight:600; width:28px; text-align:center; flex-shrink:0;">
        ${day}
      </div>

      <!-- Month + Year -->
      <div class="text-center me-3 ms-1" style="line-height:1; flex-shrink:0;">
        <div style="color: ${cal_colors[monthIndex]}; font-size:0.85em; text-transform:uppercase; font-weight:500;">
          ${month}
        </div>
        <div style="color: ${cal_colors[monthIndex]}; font-size:0.78em; text-transform:uppercase; opacity:0.7;">
          ${year}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-grow-1" style="min-width:0;">
        <div style="line-height:1.2;">
          <span class="event-title"
                style="
                  color: ${cal_colors[monthIndex]};
                  font-size:1.05em;
                  white-space:normal;
                  word-break:break-word;
                  overflow-wrap:break-word;
                  display:block;
                ">
            ${item.event}
          </span>
        </div>
      </div>

    </div>
  `);

  $container.append($li);
});



}

function color_day_modifier(container, color, h_color) {
  var column1 = $(container + '.calendar table.month tr th.day-header ')
    .filter(function () {
      return $(this).text() === 'Su';
    })
    .index();
  var column2 = $(container + '.calendar table.month tr th.day-header ')
    .filter(function () {
      return $(this).text() === 'Sa';
    })
    .index();
  if (column1 > -1) {
    $(container + '.calendar table.month tr').each(function () {
      $(this)
        .find('td.day')
        .eq(column1)
        .find('.day-content')
        .css('color', color);
    });
  }
  if (column2 > -1) {
    $(container + '.calendar table.month tr').each(function () {
      $(this)
        .find('td.day')
        .eq(column2)
        .find('.day-content')
        .css('color', color);
    });
  }

  $(container + '.calendar table.month tr').each(function () {
    $(this).find('th.day-header ').eq(0).css('color', h_color);
  });
}

var cal_month_holder = null;
function hover_cal_month(data, container, list_container, year) {
  //var currentYear = new Date().getFullYear();
  $(container + ' .month-container .month')
    .mouseenter(function () {
      if (
        $(this).find('.month-title').text() != cal_month_holder &&
        cal_month_holder == null
      ) {
        populate_callist(
          data,
          list_container,
          year,
          $(this).find('.month-title').text(),
        );
        cal_month_holder = $(this).find('.month-title').text();
      }
      // console.log("show")
    })
    .mouseleave(function () {
      if (cal_month_holder != null) {
        populate_callist(data, list_container, year);
        cal_month_holder = null;
      }
      //console.log("hide")
    });
}

 function get_data (year){
  let data_result= [] ;
    $.ajax({
      url: "https://date.nager.at/api/v3/PublicHolidays/"+year+"/PH",
      method: "GET",
      dataType: "json",
      async: false,
      success: function(data) {
        // Map API response to your raw_data structure
         data_result = data.map((item, index) => ({
          id: index + 1,
          event: item.name,
          eventdate: item.date
        }));

      
      },
      error: function(err) {
        console.error("Failed to load holidays:", err);
      }
    });
  return data_result;
}


generate_calendar( '#calendar', '#calendar_events');


// for divider 

const divider = document.getElementById('divider');
const eventPanel = document.getElementById('event-panel');
const calendarPanel = document.getElementById('calendar-panel');
const wrapper = document.getElementById('calendar-wrapper');

let isResizing = false;

const minEventWidth = 200;
const maxEventWidth = 600;
const minCalendarWidth = 300;

divider.addEventListener('mousedown', () => {
  isResizing = true;
  document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;

  const totalWidth = wrapper.offsetWidth;
  let newEventWidth = e.clientX;
  let newCalendarWidth = totalWidth - newEventWidth - divider.offsetWidth;

  // enforce limits for both panels
  if (newEventWidth < minEventWidth) {
    newEventWidth = minEventWidth;
    newCalendarWidth = totalWidth - newEventWidth - divider.offsetWidth;
  }
  if (newEventWidth > maxEventWidth) {
    newEventWidth = maxEventWidth;
    newCalendarWidth = totalWidth - newEventWidth - divider.offsetWidth;
  }
  if (newCalendarWidth < minCalendarWidth) {
    newCalendarWidth = minCalendarWidth;
    newEventWidth = totalWidth - newCalendarWidth - divider.offsetWidth;
  }

  eventPanel.style.width = newEventWidth + 'px';
  calendarPanel.style.width = newCalendarWidth + 'px';
});

document.addEventListener('mouseup', () => {
  isResizing = false;
  document.body.style.cursor = 'default';
});
