
import { IsNotEmpty, MinLength, IsString, IsPhoneNumber, IsEmail } from 'class-validator'


export class CreateUserDto {

    @IsNotEmpty({ message: 'firstname must not be empty' })
    @IsString({ message: "firstname must be a string" })
    readonly firstname: string;

    @IsNotEmpty({ message: 'lastname must not be empty' })
    @IsString({ message: "lastname must be a string" })
    readonly lastname: string;

    @IsNotEmpty({ message: 'Email must not be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;

    @IsNotEmpty({ message: 'Password must not be empty' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    readonly password: string;

    @IsNotEmpty({ message: 'Phone number must not be empty' })
    phone_no: string;
}

