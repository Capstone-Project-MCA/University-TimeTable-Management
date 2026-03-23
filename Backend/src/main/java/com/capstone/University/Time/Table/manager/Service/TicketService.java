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

    public List<TicketDto> generateTicket(List<CourseMapping> courseMappings) {
        List<Ticket> ticketList = new ArrayList<>();
        List<TicketDto> ticketDtoList = new ArrayList<>();

        for(CourseMapping courseMapping : courseMappings){
            // Skip mappings where faculty has not been assigned — frontend confirms this is intentional
            if (courseMapping.getFacultyUID() == null || courseMapping.getFacultyUID().isBlank()) {
                continue;
            }

            Long courseMappingId = courseMapping.getCourseMappingId();
            String courseCode = courseMapping.getCoursecode();
            String sectionId = courseMapping.getSection();
            Short groupNo = courseMapping.getGroupNo();
            String mappingType = courseMapping.getMappingType();
            String facultyUID = courseMapping.getFacultyUID();
            Short L = courseMapping.getL();
            Short T = courseMapping.getT();
            Short P = courseMapping.getP();
            Boolean MergeStatus = courseMapping.getMergeStatus();

            if(mappingType.equals("L")) {
                for(int i = 1; i <= L; i++){
                    Ticket ticket = new Ticket();
                    String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                    ticket.setTicketId(TicketId);
                    ticket.setGroupNo(groupNo);
                    ticket.setCoursecode(courseCode);
                    ticket.setSection(sectionId);
                    ticket.setLectureNo((short)i);
                    ticket.setFacultyUID(facultyUID);
                    ticket.setCourseMappingId(courseMappingId);
                    ticket.setMergedCode(Boolean.TRUE.equals(MergeStatus) && courseMapping.getMergecode() != null
                        ? courseMapping.getMergecode() : "");
                    ticketList.add(ticket);
                }
            }
            else if(mappingType.equals("T")) {
                for(int i = 1; i <= T; i++){
                    Ticket ticket = new Ticket();
                    String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                    ticket.setTicketId(TicketId);
                    ticket.setGroupNo(groupNo);
                    ticket.setCoursecode(courseCode);
                    ticket.setSection(sectionId);
                    ticket.setLectureNo((short)i);
                    ticket.setFacultyUID(facultyUID);
                    ticket.setCourseMappingId(courseMappingId);
                    ticket.setMergedCode(Boolean.TRUE.equals(MergeStatus) && courseMapping.getMergecode() != null
                        ? courseMapping.getMergecode() : "");
                    ticketList.add(ticket);
                }
            }
            else if(mappingType.equals("P")) {
                for(int i = 1; i <= P; i++){
                    Ticket ticket = new Ticket();
                    String TicketId = courseCode + sectionId + groupNo.toString() + mappingType + i;
                    ticket.setTicketId(TicketId);
                    ticket.setGroupNo(groupNo);
                    ticket.setCoursecode(courseCode);
                    ticket.setSection(sectionId);
                    ticket.setLectureNo((short)i);
                    ticket.setFacultyUID(facultyUID);
                    ticket.setCourseMappingId(courseMappingId);
                    ticket.setMergedCode(Boolean.TRUE.equals(MergeStatus) && courseMapping.getMergecode() != null
                        ? courseMapping.getMergecode() : "");
                    ticketList.add(ticket);
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

    public List<TicketDto> getAllTickers(){
        List<TicketDto> ticketDtoList = new ArrayList<>();
        List<Ticket> ticketList = ticketRepository.findAll();

        ticketList.forEach(ticket -> {
            TicketDto tickerDto = ticketMapper.toDto(ticket);
            ticketDtoList.add(tickerDto);
        });

        return ticketDtoList;
    }
}
