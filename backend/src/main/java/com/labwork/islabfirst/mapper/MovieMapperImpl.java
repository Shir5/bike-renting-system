package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.request.CreateMovieRequest;
import com.labwork.islabfirst.dto.request.UpdateMovieRequest;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.MovieGenre;
import com.labwork.islabfirst.entity.model.MpaaRating;
import com.labwork.islabfirst.entity.security.User;

import java.time.LocalDateTime;
import java.util.Date;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;


@Component
public class MovieMapperImpl implements MovieMapper {

    @Override
    public Movie toEntity(MovieDto dto) {
        if ( dto == null ) {
            return null;
        }

        Movie movie = new Movie();

        movie.setOwner( userDtoToUser( dto.owner() ) );
        movie.setId( dto.id() );
        movie.setName( dto.name() );
        movie.setCoordinates( coordinatesDtoToCoordinates( dto.coordinates() ) );
        movie.setCreationDate( dto.creationDate() );
        movie.setOscarsCount( dto.oscarsCount() );
        movie.setBudget( dto.budget() );
        if ( dto.totalBoxOffice() != null ) {
            movie.setTotalBoxOffice( dto.totalBoxOffice() );
        }
        if ( dto.mpaaRating() != null ) {
            movie.setMpaaRating( Enum.valueOf( MpaaRating.class, dto.mpaaRating() ) );
        }
        movie.setLength( dto.length() );
        movie.setGoldenPalmCount( dto.goldenPalmCount() );
        movie.setUsaBoxOffice( dto.usaBoxOffice() );
        movie.setTagline( dto.tagline() );
        if ( dto.genre() != null ) {
            movie.setGenre( Enum.valueOf( MovieGenre.class, dto.genre() ) );
        }

        return movie;
    }

    @Override
    public MovieDto toDto(Movie entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        CoordinatesDto coordinates = null;
        Date creationDate = null;
        int oscarsCount = 0;
        Double budget = null;
        Long totalBoxOffice = null;
        String mpaaRating = null;
        Integer length = null;
        int goldenPalmCount = 0;
        Integer usaBoxOffice = null;
        String tagline = null;
        String genre = null;
        UserDto owner = null;


        id = entity.getId();
        name = entity.getName();
        coordinates = coordinatesToCoordinatesDto( entity.getCoordinates() );
        creationDate = entity.getCreationDate();
        oscarsCount = entity.getOscarsCount();
        budget = entity.getBudget();
        totalBoxOffice = entity.getTotalBoxOffice();
        if ( entity.getMpaaRating() != null ) {
            mpaaRating = entity.getMpaaRating().name();
        }
        length = entity.getLength();
        goldenPalmCount = entity.getGoldenPalmCount();
        usaBoxOffice = entity.getUsaBoxOffice();
        tagline = entity.getTagline();
        if ( entity.getGenre() != null ) {
            genre = entity.getGenre().name();
        }
        owner = userToUserDto( entity.getOwner() );

        Long directorID = entity.getDirector().getId();
        Long screenwriterID = entity.getScreenwriter().getId();
        Long operatorID = entity.getOperator().getId();



        MovieDto movieDto = new MovieDto( id, name, coordinates, creationDate, oscarsCount, budget, totalBoxOffice, mpaaRating, directorID, screenwriterID, operatorID, length, goldenPalmCount, usaBoxOffice, tagline, genre, owner );

        return movieDto;
    }

    @Override
    public Movie toEntity(CreateMovieRequest request) {
        if ( request == null ) {
            return null;
        }

        Movie movie = new Movie();

        movie.setName( request.name() );
        movie.setCoordinates( coordinatesDtoToCoordinates( request.coordinates() ) );
        movie.setCreationDate( request.creationDate() );
        movie.setOscarsCount( request.oscarsCount() );
        movie.setBudget( request.budget() );
        if ( request.totalBoxOffice() != null ) {
            movie.setTotalBoxOffice( request.totalBoxOffice() );
        }
        if ( request.mpaaRating() != null ) {
            movie.setMpaaRating( Enum.valueOf( MpaaRating.class, request.mpaaRating() ) );
        }
        movie.setLength( request.length() );
        movie.setGoldenPalmCount( request.goldenPalmCount() );
        movie.setUsaBoxOffice( request.usaBoxOffice() );
        movie.setTagline( request.tagline() );
        if ( request.genre() != null ) {
            movie.setGenre( Enum.valueOf( MovieGenre.class, request.genre() ) );
        }

        return movie;
    }

    @Override
    public Movie toEntity(UpdateMovieRequest request) {
        if ( request == null ) {
            return null;
        }

        Movie movie = new Movie();

        movie.setName( request.name() );
        movie.setCoordinates( coordinatesDtoToCoordinates( request.coordinates() ) );
        movie.setCreationDate( request.creationDate() );
        movie.setOscarsCount( request.oscarsCount() );
        movie.setBudget( request.budget() );
        if ( request.totalBoxOffice() != null ) {
            movie.setTotalBoxOffice( request.totalBoxOffice() );
        }
        if ( request.mpaaRating() != null ) {
            movie.setMpaaRating( Enum.valueOf( MpaaRating.class, request.mpaaRating() ) );
        }
        movie.setLength( request.length() );
        movie.setGoldenPalmCount( request.goldenPalmCount() );
        movie.setUsaBoxOffice( request.usaBoxOffice() );
        movie.setTagline( request.tagline() );
        if ( request.genre() != null ) {
            movie.setGenre( Enum.valueOf( MovieGenre.class, request.genre() ) );
        }

        return movie;
    }

    protected User userDtoToUser(UserDto userDto) {
        if ( userDto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( userDto.id() );
        user.username( userDto.username() );

        return user.build();
    }

    protected Coordinates coordinatesDtoToCoordinates(CoordinatesDto coordinatesDto) {
        if ( coordinatesDto == null ) {
            return null;
        }

        Coordinates.CoordinatesBuilder coordinates = Coordinates.builder();

        coordinates.x( coordinatesDto.x() );
        coordinates.y( coordinatesDto.y() );

        return coordinates.build();
    }

    protected CoordinatesDto coordinatesToCoordinatesDto(Coordinates coordinates) {
        if ( coordinates == null ) {
            return null;
        }

        Long x = null;
        Long y = null;

        x = coordinates.getX();
        y = coordinates.getY();

        CoordinatesDto coordinatesDto = new CoordinatesDto( x, y );

        return coordinatesDto;
    }

    protected UserDto userToUserDto(User user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String username = null;

        id = user.getId();
        username = user.getUsername();

        UserDto userDto = new UserDto( id, username );

        return userDto;
    }
}
