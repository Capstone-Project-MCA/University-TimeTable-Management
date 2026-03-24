package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.TicketDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.Ticket;
import com.capstone.University.Time.Table.manager.Mapper.*;
import com.capstone.University.Time.Table.manager.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalTime;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final CourseMappingRepository courseMappingRepository;
    private final FacultyRepository facultyRepository;
    private final TicketMapper ticketMapper;

    @Autowired
    public TicketService(
            TicketRepository ticketRepository,
            CourseRepository courseRepository,
            SectionRepository sectionRepository,
            CourseMappingRepository courseMappingRepository,
            FacultyRepository facultyRepository,
            TicketMapper ticketMapper
    ) {
        this.ticketRepository = ticketRepository;
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.courseMappingRepository = courseMappingRepository;
        this.facultyRepository = facultyRepository;
        this.ticketMapper = ticketMapper;
    }

    public List<TicketDto> generateMergedSectionsTicket(List<CourseMapping> courseMappings){
        List<Ticket> ticketList = new ArrayList<>();
        List<TicketDto> ticketDtoList = new ArrayList<>();

        for (CourseMapping courseMapping : courseMappings) {
            Long courseMappingId = courseMapping.getCourseMappingId();
            String courseCode = courseMapping.getCoursecode();
            String sectionId = courseMapping.getSection();
            Short groupNo = courseMapping.getGroupNo();
            String mappingType = courseMapping.getMappingType();

            if(courseMapping.getFacultyUID() == null) continue;

            String facultyUID = courseMapping.getFacultyUID();
            Short L = courseMapping.getL();
            Short T = courseMapping.getT();
            Short P = courseMapping.getP();
            String mergeCode = courseMapping.getMergecode();
            Boolean MergeStatus = courseMapping.getMergeStatus();

            if(MergeStatus == true){
                switch (mappingType) {
                    case "L" -> {
                        for (int i = 1; i <= L; i++) {
                            Ticket ticket = new Ticket();
                            String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                            ticket.setTicketId(TicketId);
                            ticket.setGroupNo(groupNo);
                            ticket.setCoursecode(courseCode);
                            ticket.setSection(sectionId);
                            ticket.setLectureNo((short) i);
                            ticket.setFacultyUID(facultyUID);
                            ticket.setCourseMappingId(courseMappingId);
                            ticket.setMergedCode(courseMapping.getMergecode());
                            ticketList.add(ticket);
                        }
                    }
                    case "T" -> {
                        for (int i = 1; i <= T; i++) {
                            Ticket ticket = new Ticket();
                            String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                            ticket.setTicketId(TicketId);
                            ticket.setGroupNo(groupNo);
                            ticket.setCoursecode(courseCode);
                            ticket.setSection(sectionId);
                            ticket.setLectureNo((short) i);
                            ticket.setFacultyUID(facultyUID);
                            ticket.setCourseMappingId(courseMappingId);
                            ticket.setMergedCode(courseMapping.getMergecode());
                            ticketList.add(ticket);
                        }
                    }
                    case "P" -> {
                        for (int i = 1; i <= P; i++) {
                            Ticket ticket = new Ticket();
                            String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                            ticket.setTicketId(TicketId);
                            ticket.setGroupNo(groupNo);
                            ticket.setCoursecode(courseCode);
                            ticket.setSection(sectionId);
                            ticket.setLectureNo((short) i);
                            ticket.setFacultyUID(facultyUID);
                            ticket.setCourseMappingId(courseMappingId);
                            ticket.setMergedCode(courseMapping.getMergecode());
                            ticketList.add(ticket);
                        }
                    }
                }
            }
        }
        ticketRepository.saveAll(ticketList);
        ticketList.forEach(ticket -> {
            TicketDto tickerDto = ticketMapper.toDto(ticket);
            ticketDtoList.add(tickerDto);
        });

        return ticketDtoList;
    }

    public List<TicketDto> generateTicket(List<CourseMapping> courseMappings) {
        List<Ticket> ticketList = new ArrayList<>();
        List<TicketDto> ticketDtoList = new ArrayList<>();

        for(CourseMapping courseMapping : courseMappings){
            Long courseMappingId = courseMapping.getCourseMappingId();
            String courseCode = courseMapping.getCoursecode();
            String sectionId = courseMapping.getSection();
            Short groupNo = courseMapping.getGroupNo();
            String mappingType = courseMapping.getMappingType();

            if(courseMapping.getFacultyUID() == null) continue;

            String facultyUID = courseMapping.getFacultyUID();
            Short L = courseMapping.getL();
            Short T = courseMapping.getT();
            Short P = courseMapping.getP();
            Boolean MergeStatus = courseMapping.getMergeStatus();

            if(MergeStatus == true){
                continue;
            }

            switch (mappingType) {
                case "L" -> {
                    for (int i = 1; i <= L; i++) {
                        Ticket ticket = new Ticket();
                        String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                        ticket.setTicketId(TicketId);
                        ticket.setGroupNo(groupNo);
                        ticket.setCoursecode(courseCode);
                        ticket.setSection(sectionId);
                        ticket.setLectureNo((short) i);
                        ticket.setFacultyUID(facultyUID);
                        ticket.setCourseMappingId(courseMappingId);
                        ticketList.add(ticket);
                    }
                }
                case "T" -> {
                    for (int i = 1; i <= T; i++) {
                        Ticket ticket = new Ticket();
                        String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                        ticket.setTicketId(TicketId);
                        ticket.setGroupNo(groupNo);
                        ticket.setCoursecode(courseCode);
                        ticket.setSection(sectionId);
                        ticket.setLectureNo((short) i);
                        ticket.setFacultyUID(facultyUID);
                        ticket.setCourseMappingId(courseMappingId);
                        ticketList.add(ticket);
                    }
                }
                case "P" -> {
                    for (int i = 1; i <= P; i++) {
                        Ticket ticket = new Ticket();
                        String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                        ticket.setTicketId(TicketId);
                        ticket.setGroupNo(groupNo);
                        ticket.setCoursecode(courseCode);
                        ticket.setSection(sectionId);
                        ticket.setLectureNo((short) i);
                        ticket.setFacultyUID(facultyUID);
                        ticket.setCourseMappingId(courseMappingId);
                        ticketList.add(ticket);
                    }
                }
            }
        }

        ticketRepository.saveAll(ticketList);
        ticketList.forEach(ticket -> {
            TicketDto tickerDto = ticketMapper.toDto(ticket);
            ticketDtoList.add(tickerDto);
        });

        return ticketDtoList;
    }

    public List<TicketDto> generateAllTickets() {
        List<CourseMapping> allMappings = courseMappingRepository.findAll();
        return generateTicket(allMappings);
    }

    public List<TicketDto> getAllTickets(){
        List<TicketDto> ticketDtoList = new ArrayList<>();
        List<Ticket> ticketList = ticketRepository.findAll();

        ticketList.forEach(ticket -> {
            TicketDto tickerDto = ticketMapper.toDto(ticket);
            ticketDtoList.add(tickerDto);
        });

        return ticketDtoList;
    }

    public List<TicketDto> getAllTicketsBySectionId(String sectionId){
        List<TicketDto> ticketDtoList = new ArrayList<>();
        List<Ticket> tickitList = ticketRepository.findBySection(sectionId);

        tickitList.forEach(ticket -> {
            TicketDto tickerDto = ticketMapper.toDto(ticket);
            ticketDtoList.add(tickerDto);
        });

        return ticketDtoList;
    }

    public TicketDto scheduleTicket(String ticketId, String day, String time) {
        return ticketRepository.findById(ticketId).map(ticket -> {
            ticket.setDay(day);
            ticket.setTime(time != null ? LocalTime.parse(time) : null);
            ticketRepository.save(ticket);
            return ticketMapper.toDto(ticket);
        }).orElse(null);
    }

    public void deleteAllTickets(){
        ticketRepository.deleteAll();
        ticketRepository.truncateTable();
    }
}
