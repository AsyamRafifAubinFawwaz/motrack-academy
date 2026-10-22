<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = Auth::user();

        $redirectTo = match ($user->role) {
            'superadmin' => '/superadmin/dashboard',
            'mentor'     => '/mentor/dashboard',
            'siswa'      => '/siswa/dashboard',
            default      => '/',
        };

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($redirectTo);
    }
}
