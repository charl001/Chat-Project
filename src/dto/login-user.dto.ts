
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator'



export class LoginUserDto {

    @IsNotEmpty({ message: 'Email must not be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;

    @IsNotEmpty({ message: 'Password must not be empty' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    readonly password: string;
}